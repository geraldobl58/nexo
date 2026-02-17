#!/bin/bash
set -e

echo "🚀 Nexo CloudLab - Instalando Stack de Observabilidade"
echo "======================================================="

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Namespace
NAMESPACE="monitoring"

echo -e "${YELLOW}📦 Instalando kube-prometheus-stack (Prometheus + Grafana + AlertManager)...${NC}"

# Adicionar repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Criar values customizado
cat <<EOF > /tmp/prometheus-values.yaml
# Valores customizados para ambiente local
prometheus:
  prometheusSpec:
    storageSpec:
      volumeClaimTemplate:
        spec:
          storageClassName: local-path-ssd
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 10Gi
    retention: 7d
    retentionSize: "9GB"
    resources:
      requests:
        cpu: 200m
        memory: 512Mi
      limits:
        cpu: 1000m
        memory: 2Gi
    # ServiceMonitor para coletar métricas dos apps
    serviceMonitorSelectorNilUsesHelmValues: false
    podMonitorSelectorNilUsesHelmValues: false
  
  ingress:
    enabled: true
    ingressClassName: nginx
    hosts:
      - prometheus.local.nexo.dev
    paths:
      - /

grafana:
  enabled: true
  adminPassword: "nexo@local2026"
  persistence:
    enabled: true
    storageClassName: local-path-ssd
    size: 5Gi
  
  ingress:
    enabled: true
    ingressClassName: nginx
    hosts:
      - grafana.local.nexo.dev
    path: /
  
  # Dashboards automáticos
  dashboardProviders:
    dashboardproviders.yaml:
      apiVersion: 1
      providers:
      - name: 'default'
        orgId: 1
        folder: ''
        type: file
        disableDeletion: false
        editable: true
        options:
          path: /var/lib/grafana/dashboards/default
  
  # Datasources
  datasources:
    datasources.yaml:
      apiVersion: 1
      datasources:
      - name: Prometheus
        type: prometheus
        url: http://prometheus-operated:9090
        isDefault: true
        editable: true
  
  # Dashboards pré-configurados
  dashboards:
    default:
      kubernetes-cluster:
        gnetId: 7249
        revision: 1
        datasource: Prometheus
      kubernetes-pods:
        gnetId: 6417
        revision: 1
        datasource: Prometheus
      node-exporter:
        gnetId: 1860
        revision: 27
        datasource: Prometheus
      nginx-ingress:
        gnetId: 9614
        revision: 1
        datasource: Prometheus

alertmanager:
  enabled: true
  alertmanagerSpec:
    storage:
      volumeClaimTemplate:
        spec:
          storageClassName: local-path-ssd
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 2Gi
  
  ingress:
    enabled: true
    ingressClassName: nginx
    hosts:
      - alertmanager.local.nexo.dev
    paths:
      - /
  
  config:
    global:
      resolve_timeout: 5m
    route:
      group_by: ['alertname', 'cluster', 'service']
      group_wait: 10s
      group_interval: 10s
      repeat_interval: 12h
      receiver: 'null'
      routes:
      - match:
          alertname: Watchdog
        receiver: 'null'
    receivers:
    - name: 'null'

# Node Exporter
nodeExporter:
  enabled: true

# Kube State Metrics
kubeStateMetrics:
  enabled: true

# Configurações do Operator
prometheusOperator:
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 512Mi
EOF

# Instalar
helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace $NAMESPACE \
  --create-namespace \
  --values /tmp/prometheus-values.yaml \
  --wait \
  --timeout 10m

# Aguardar pods ficarem prontos
echo -e "${YELLOW}⏳ Aguardando pods ficarem prontos...${NC}"
kubectl wait --for=condition=ready pod \
  --selector=app.kubernetes.io/name=grafana \
  --namespace=$NAMESPACE \
  --timeout=300s

kubectl wait --for=condition=ready pod \
  --selector=app.kubernetes.io/name=prometheus \
  --namespace=$NAMESPACE \
  --timeout=300s

# Criar ServiceMonitor para ArgoCD
echo -e "${YELLOW}📊 Configurando ServiceMonitor para ArgoCD...${NC}"
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Service
metadata:
  name: argocd-metrics
  namespace: argocd
  labels:
    app.kubernetes.io/name: argocd-server
spec:
  ports:
  - name: metrics
    port: 8083
    protocol: TCP
    targetPort: 8083
  selector:
    app.kubernetes.io/name: argocd-server
---
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: argocd-metrics
  namespace: monitoring
  labels:
    release: kube-prometheus-stack
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: argocd-server
  namespaceSelector:
    matchNames:
    - argocd
  endpoints:
  - port: metrics
    interval: 30s
EOF

# Criar PrometheusRule para alertas customizados
echo -e "${YELLOW}🚨 Configurando alertas customizados...${NC}"
cat <<EOF | kubectl apply -f -
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: nexo-alerts
  namespace: monitoring
  labels:
    release: kube-prometheus-stack
spec:
  groups:
  - name: nexo.rules
    interval: 30s
    rules:
    - alert: PodCrashLooping
      expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "Pod {{ \$labels.namespace }}/{{ \$labels.pod }} está em crash loop"
        description: "Pod {{ \$labels.namespace }}/{{ \$labels.pod }} reiniciou {{ \$value }} vezes nos últimos 15 minutos"
    
    - alert: HighMemoryUsage
      expr: (sum(container_memory_working_set_bytes) by (pod, namespace) / sum(container_spec_memory_limit_bytes) by (pod, namespace)) > 0.9
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "Alto uso de memória"
        description: "Pod {{ \$labels.namespace }}/{{ \$labels.pod }} está usando mais de 90% da memória"
    
    - alert: HighCPUUsage
      expr: (sum(rate(container_cpu_usage_seconds_total[5m])) by (pod, namespace) / sum(container_spec_cpu_quota/container_spec_cpu_period) by (pod, namespace)) > 0.9
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "Alto uso de CPU"
        description: "Pod {{ \$labels.namespace }}/{{ \$labels.pod }} está usando mais de 90% da CPU"
EOF

echo ""
echo -e "${GREEN}✅ Stack de Observabilidade instalada com sucesso!${NC}"
echo ""
echo -e "${BLUE}📊 Informações de Acesso:${NC}"
echo ""
echo "  Grafana:"
echo "    URL: http://grafana.local.nexo.dev"
echo "    Usuário: admin"
echo "    Senha: nexo@local2026"
echo ""
echo "  Prometheus:"
echo "    URL: http://prometheus.local.nexo.dev"
echo ""
echo "  AlertManager:"
echo "    URL: http://alertmanager.local.nexo.dev"
echo ""
echo -e "${BLUE}📦 Comandos úteis:${NC}"
echo "  kubectl get pods -n monitoring"
echo "  kubectl get servicemonitors -n monitoring"
echo "  kubectl get prometheusrules -n monitoring"
echo ""
echo "Próximo passo: ./scripts/04-install-elasticsearch.sh"
