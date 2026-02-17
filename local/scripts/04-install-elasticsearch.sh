#!/bin/bash
set -e

echo "🚀 Nexo CloudLab - Instalando Elasticsearch Stack"
echo "=================================================="

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

NAMESPACE="logging"

echo -e "${YELLOW}📦 Instalando Elasticsearch...${NC}"

# Adicionar repo
helm repo add elastic https://helm.elastic.co
helm repo update

# Instalar Elasticsearch
cat <<EOF > /tmp/elasticsearch-values.yaml
replicas: 1
minimumMasterNodes: 1

# Recursos reduzidos para ambiente local
esJavaOpts: "-Xmx512m -Xms512m"

resources:
  requests:
    cpu: "500m"
    memory: "1Gi"
  limits:
    cpu: "1000m"
    memory: "2Gi"

# Volume persistente
volumeClaimTemplate:
  storageClassName: local-path-ssd
  accessModes: [ "ReadWriteOnce" ]
  resources:
    requests:
      storage: 10Gi

# Security desabilitada para ambiente local
esConfig:
  elasticsearch.yml: |
    xpack.security.enabled: false
    xpack.security.transport.ssl.enabled: false
    xpack.security.http.ssl.enabled: false
EOF

helm upgrade --install elasticsearch elastic/elasticsearch \
  --namespace $NAMESPACE \
  --create-namespace \
  --values /tmp/elasticsearch-values.yaml \
  --wait \
  --timeout 10m

# Aguardar Elasticsearch ficar pronto
echo -e "${YELLOW}⏳ Aguardando Elasticsearch ficar pronto...${NC}"
kubectl wait --for=condition=ready pod \
  --selector=app=elasticsearch-master \
  --namespace=$NAMESPACE \
  --timeout=600s

# Instalar Kibana
echo -e "${YELLOW}📦 Instalando Kibana...${NC}"
cat <<EOF > /tmp/kibana-values.yaml
elasticsearchHosts: "http://elasticsearch-master:9200"

resources:
  requests:
    cpu: "200m"
    memory: "512Mi"
  limits:
    cpu: "1000m"
    memory: "1Gi"

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: kibana.local.nexo.dev
      paths:
        - path: /

kibanaConfig:
  kibana.yml: |
    server.host: "0.0.0.0"
    elasticsearch.hosts: [ "http://elasticsearch-master:9200" ]
EOF

helm upgrade --install kibana elastic/kibana \
  --namespace $NAMESPACE \
  --values /tmp/kibana-values.yaml \
  --wait \
  --timeout 10m

# Aguardar Kibana ficar pronto
echo -e "${YELLOW}⏳ Aguardando Kibana ficar pronto...${NC}"
kubectl wait --for=condition=ready pod \
  --selector=app=kibana \
  --namespace=$NAMESPACE \
  --timeout=300s

# Instalar Filebeat para coletar logs
echo -e "${YELLOW}📦 Instalando Filebeat...${NC}"
cat <<EOF > /tmp/filebeat-values.yaml
daemonset:
  enabled: true
  
filebeatConfig:
  filebeat.yml: |
    filebeat.inputs:
    - type: container
      paths:
        - /var/log/containers/*.log
      processors:
      - add_kubernetes_metadata:
          host: \${NODE_NAME}
          matchers:
          - logs_path:
              logs_path: "/var/log/containers/"
      - drop_event:
          when:
            or:
            - equals:
                kubernetes.namespace: "kube-system"
            - equals:
                kubernetes.namespace: "kube-public"
    
    output.elasticsearch:
      hosts: ['http://elasticsearch-master:9200']
      indices:
        - index: "filebeat-nexo-%{+yyyy.MM.dd}"
          when.contains:
            kubernetes.namespace: "nexo-local"
        - index: "filebeat-apps-%{+yyyy.MM.dd}"
          when.or:
            - contains:
                kubernetes.namespace: "nexo-local"
            - contains:
                kubernetes.namespace: "argocd"
        - index: "filebeat-monitoring-%{+yyyy.MM.dd}"
          when.contains:
            kubernetes.namespace: "monitoring"

resources:
  requests:
    cpu: "100m"
    memory: "128Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"
EOF

helm upgrade --install filebeat elastic/filebeat \
  --namespace $NAMESPACE \
  --values /tmp/filebeat-values.yaml \
  --wait

# Criar índices no Kibana
echo -e "${YELLOW}🔧 Configurando índices no Kibana...${NC}"
sleep 30

# Port-forward temporário para configurar Kibana
kubectl port-forward -n $NAMESPACE svc/kibana-kibana 5601:5601 &
PF_PID=$!
sleep 5

# Criar index patterns
curl -X POST "localhost:5601/api/saved_objects/index-pattern/filebeat-*" \
  -H 'kbn-xsrf: true' \
  -H 'Content-Type: application/json' \
  -d '{
    "attributes": {
      "title": "filebeat-*",
      "timeFieldName": "@timestamp"
    }
  }' 2>/dev/null || true

# Matar port-forward
kill $PF_PID 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ Elasticsearch Stack instalado com sucesso!${NC}"
echo ""
echo -e "${BLUE}📊 Informações de Acesso:${NC}"
echo ""
echo "  Kibana:"
echo "    URL: http://kibana.local.nexo.dev"
echo "    Sem autenticação (ambiente local)"
echo ""
echo "  Elasticsearch:"
echo "    URL: http://elasticsearch-master.logging:9200"
echo "    Port-forward: kubectl port-forward -n logging svc/elasticsearch-master 9200:9200"
echo ""
echo -e "${BLUE}📦 Comandos úteis:${NC}"
echo "  kubectl get pods -n logging"
echo "  kubectl logs -n logging -l app=elasticsearch-master"
echo "  kubectl logs -n logging -l app=filebeat"
echo ""
echo -e "${BLUE}🔍 Consultas úteis no Kibana:${NC}"
echo "  Index pattern: filebeat-*"
echo "  Filtrar por namespace: kubernetes.namespace: nexo-local"
echo "  Ver logs de erro: log.level: error"
echo ""
echo "Próximo passo: ./scripts/05-deploy-apps.sh"
