<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('firstName','lastName','email','username','password','password-confirm'); section>
    <#if section = "header">
        <div class="mb-6">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">${msg("registerTitle")}</h2>
            <p class="text-sm text-gray-600">${msg("registerSubtitle")}</p>
        </div>
    <#elseif section = "form">
        <form id="kc-register-form" class="space-y-5" action="${url.registrationAction}" method="post">
            
            <#if !realm.registrationEmailAsUsername>
                <!-- Nome de usuário -->
                <div>
                    <label for="username" class="block text-sm font-semibold text-gray-900 mb-2">
                        ${msg("username")} <span class="text-red-500">*</span>
                    </label>
                    <input 
                        type="text" 
                        id="username" 
                        name="username" 
                        value="${(register.formData.username!'')}"
                        class="block w-full px-4 py-3 text-gray-900 border ${messagesPerField.existsError('username')?then('border-red-500','border-gray-300')} rounded-lg shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-base"
                        placeholder="${msg('usernamePlaceholder')}"
                        autocomplete="username"
                        aria-invalid="${messagesPerField.existsError('username')?then('true','false')}"
                    />
                    <#if messagesPerField.existsError('username')>
                        <span class="text-sm text-red-600 mt-1 block">${kcSanitize(messagesPerField.get('username'))?no_esc}</span>
                    </#if>
                </div>
            </#if>

            <!-- Nome -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="firstName" class="block text-sm font-semibold text-gray-900 mb-2">
                        ${msg("firstName")} <span class="text-red-500">*</span>
                    </label>
                    <input 
                        type="text" 
                        id="firstName" 
                        name="firstName" 
                        value="${(register.formData.firstName!'')}"
                        class="block w-full px-4 py-3 text-gray-900 border ${messagesPerField.existsError('firstName')?then('border-red-500','border-gray-300')} rounded-lg shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-base"
                        placeholder="${msg('firstNamePlaceholder')}"
                        autocomplete="given-name"
                    />
                    <#if messagesPerField.existsError('firstName')>
                        <span class="text-sm text-red-600 mt-1 block">${kcSanitize(messagesPerField.get('firstName'))?no_esc}</span>
                    </#if>
                </div>

                <div>
                    <label for="lastName" class="block text-sm font-semibold text-gray-900 mb-2">
                        ${msg("lastName")} <span class="text-red-500">*</span>
                    </label>
                    <input 
                        type="text" 
                        id="lastName" 
                        name="lastName" 
                        value="${(register.formData.lastName!'')}"
                        class="block w-full px-4 py-3 text-gray-900 border ${messagesPerField.existsError('lastName')?then('border-red-500','border-gray-300')} rounded-lg shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-base"
                        placeholder="${msg('lastNamePlaceholder')}"
                        autocomplete="family-name"
                    />
                    <#if messagesPerField.existsError('lastName')>
                        <span class="text-sm text-red-600 mt-1 block">${kcSanitize(messagesPerField.get('lastName'))?no_esc}</span>
                    </#if>
                </div>
            </div>

            <!-- E-mail -->
            <div>
                <label for="email" class="block text-sm font-semibold text-gray-900 mb-2">
                    ${msg("email")} <span class="text-red-500">*</span>
                </label>
                <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value="${(register.formData.email!'')}"
                    class="block w-full px-4 py-3 text-gray-900 border ${messagesPerField.existsError('email')?then('border-red-500','border-gray-300')} rounded-lg shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-base"
                    placeholder="${msg('emailPlaceholder')}"
                    autocomplete="email"
                />
                <#if messagesPerField.existsError('email')>
                    <span class="text-sm text-red-600 mt-1 block">${kcSanitize(messagesPerField.get('email'))?no_esc}</span>
                </#if>
            </div>

            <!-- CPF e Telefone -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

                <!-- CPF -->
                <div>
                    <label for="cpf" class="block text-sm font-semibold text-gray-900 mb-2">
                        CPF <span class="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="cpf"
                        name="user.attributes.cpf"
                        value="${(register.formData['user.attributes.cpf']!'')}"
                        class="block w-full px-4 py-3 text-gray-900 border ${messagesPerField.existsError('user.attributes.cpf')?then('border-red-500','border-gray-300')} rounded-lg shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-base"
                        placeholder="000.000.000-00"
                    />
                    <#if messagesPerField.existsError('user.attributes.cpf')>
                        <span class="text-sm text-red-600 mt-1 block">
                            ${kcSanitize(messagesPerField.get('user.attributes.cpf'))?no_esc}
                        </span>
                    </#if>
                </div>

                <!-- Telefone -->
                <div>
                    <label for="phone" class="block text-sm font-semibold text-gray-900 mb-2">
                        Telefone <span class="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="user.attributes.phone"
                        value="${(register.formData['user.attributes.phone']!'')}"
                        class="block w-full px-4 py-3 text-gray-900 border ${messagesPerField.existsError('user.attributes.phone')?then('border-red-500','border-gray-300')} rounded-lg shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-base"
                        placeholder="(11) 99999-9999"
                    />
                    <#if messagesPerField.existsError('user.attributes.phone')>
                        <span class="text-sm text-red-600 mt-1 block">
                            ${kcSanitize(messagesPerField.get('user.attributes.phone'))?no_esc}
                        </span>
                    </#if>
                </div>

            </div>


            <!-- Senha -->
            <#if passwordRequired??>
                <div>
                    <label for="password" class="block text-sm font-semibold text-gray-900 mb-2">
                        ${msg("password")} <span class="text-red-500">*</span>
                    </label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password"
                        class="block w-full px-4 py-3 text-gray-900 border ${messagesPerField.existsError('password')?then('border-red-500','border-gray-300')} rounded-lg shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-base"
                        placeholder="${msg('passwordPlaceholder')}"
                        autocomplete="new-password"
                    />
                    <#if messagesPerField.existsError('password')>
                        <span class="text-sm text-red-600 mt-1 block">${kcSanitize(messagesPerField.get('password'))?no_esc}</span>
                    </#if>
                </div>

                <div>
                    <label for="password-confirm" class="block text-sm font-semibold text-gray-900 mb-2">
                        ${msg("passwordConfirm")} <span class="text-red-500">*</span>
                    </label>
                    <input 
                        type="password" 
                        id="password-confirm" 
                        name="password-confirm"
                        class="block w-full px-4 py-3 text-gray-900 border ${messagesPerField.existsError('password-confirm')?then('border-red-500','border-gray-300')} rounded-lg shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-base"
                        placeholder="${msg('passwordConfirmPlaceholder')}"
                        autocomplete="new-password"
                    />
                    <#if messagesPerField.existsError('password-confirm')>
                        <span class="text-sm text-red-600 mt-1 block">${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}</span>
                    </#if>
                </div>
            </#if>

            <!-- Captcha -->
            <#if recaptchaRequired??>
                <div class="g-recaptcha" data-size="compact" data-sitekey="${recaptchaSiteKey}"></div>
            </#if>

            <!-- Botões -->
            <div class="space-y-3">
                <button 
                    type="submit"
                    class="w-full flex items-center justify-center px-4 py-3 text-base font-semibold text-white bg-primary-600 rounded-lg shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
                >
                    ${msg("doRegister")}
                </button>

                <a 
                    href="${url.loginUrl}"
                    class="w-full flex items-center justify-center px-4 py-3 text-base font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
                >
                    ${msg("backToLogin")}
                </a>
            </div>
        </form>

        <script>
            document.addEventListener("DOMContentLoaded", () => {
                const cpf = document.getElementById("cpf");
                const phone = document.getElementById("phone");

                cpf?.addEventListener("input", () => {
                    cpf.value = cpf.value
                        .replace(/\D/g, "")
                        .replace(/(\d{3})(\d)/, "$1.$2")
                        .replace(/(\d{3})(\d)/, "$1.$2")
                        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                });

                phone?.addEventListener("input", () => {
                    phone.value = phone.value
                        .replace(/\D/g, "")
                        .replace(/(\d{2})(\d)/, "($1) $2")
                        .replace(/(\d{5})(\d)/, "$1-$2")
                        .replace(/(\d{4})(\d)/, "$1-$2");
                });
            });
        </script>
    </#if>
</@layout.registrationLayout>
