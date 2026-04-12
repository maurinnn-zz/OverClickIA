/**
 * Form Handler para envio via n8n
 * Autor: Sua Empresa
 * Versão: 1.0.0
 */

class FormHandler {
    constructor(formId, options = {}) {
        this.form = document.getElementById(formId);
        this.options = {
            webhookUrl: 'http://localhost:5678/webhook-test/formulario-overclick', // URL de PRODUÇÃO
            successMessage: '✅ Dados enviados com sucesso!',
            errorMessage: '❌ Falha no envio. Tente novamente.',
            validateFields: true,
            ...options
        };
        
        this.init();
    }

    init() {
        if (!this.form) {
            console.error('Formulário não encontrado');
            return;
        }

        this.bindEvents();
        this.setupMasks();
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        if (this.options.validateFields) {
            const inputs = this.form.querySelectorAll('input');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
        }
    }

    setupMasks() {
        const telefoneInput = document.getElementById('telefone');
        if (telefoneInput) {
            telefoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length <= 10) {
                    value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
                } else {
                    value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                }
                e.target.value = value;
            });
        }
    }

    validateField(input) {
        const fieldName = input.name;
        const value = input.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'nome':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Nome é obrigatório';
                } else if (value.length < 3) {
                    isValid = false;
                    errorMessage = 'Nome deve ter pelo menos 3 caracteres';
                }
                break;
            
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value) {
                    isValid = false;
                    errorMessage = 'E-mail é obrigatório';
                } else if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'E-mail inválido';
                }
                break;
            
            case 'telefone':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Telefone é obrigatório';
                } else if (value.replace(/\D/g, '').length < 10) {
                    isValid = false;
                    errorMessage = 'Telefone inválido (mínimo 10 dígitos)';
                }
                break;
            
            case 'empresa':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Nome da empresa é obrigatório';
                }
                break;
            
            case 'cargo':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Cargo é obrigatório';
                }
                break;
        }

        this.showFieldError(input, isValid ? '' : errorMessage);
        return isValid;
    }

    showFieldError(input, message) {
        const errorDiv = document.querySelector(`.error-message[data-field="${input.name}"]`);
        
        if (message) {
            input.classList.add('error');
            if (errorDiv) {
                errorDiv.textContent = message;
            }
        } else {
            input.classList.remove('error');
            if (errorDiv) {
                errorDiv.textContent = '';
            }
        }
    }

    clearFieldError(input) {
        input.classList.remove('error');
        const errorDiv = document.querySelector(`.error-message[data-field="${input.name}"]`);
        if (errorDiv) {
            errorDiv.textContent = '';
        }
    }

    validateForm() {
        const inputs = this.form.querySelectorAll('input[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    showGlobalMessage(message, type = 'success') {
        const messageDiv = document.getElementById('globalMessage');
        if (!messageDiv) return;

        messageDiv.textContent = message;
        messageDiv.className = `global-message ${type}`;
        messageDiv.style.display = 'block';

        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => {
                messageDiv.style.display = 'none';
                messageDiv.style.opacity = '1';
            }, 300);
        }, 5000);
    }

    setLoading(loading) {
        const submitBtn = this.form.querySelector('.btn-submit');
        if (!submitBtn) return;

        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        if (loading) {
            submitBtn.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'flex';
        } else {
            submitBtn.disabled = false;
            if (btnText) btnText.style.display = 'flex';
            if (btnLoading) btnLoading.style.display = 'none';
        }
    }

    getFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value.trim();
        }
        
        // ADICIONANDO DATA-HORA MANUALMENTE (Coluna A da planilha)
        const agora = new Date();
        data.data_hora = agora.toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        console.log('📊 Dados enviados para n8n (ordem da planilha):');
        console.log('A - Data/Hora:', data.data_hora);
        console.log('B - Nome:', data.nome);
        console.log('C - Email:', data.email);
        console.log('D - Telefone:', data.telefone);
        console.log('E - Empresa:', data.empresa);
        console.log('F - Cargo:', data.cargo);
        
        return data;
    }

    async sendToWebhook(data) {
        const response = await fetch(this.options.webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    async handleSubmit(event) {
        event.preventDefault();

        if (this.options.validateFields && !this.validateForm()) {
            this.showGlobalMessage('Por favor, preencha todos os campos corretamente', 'error');
            return;
        }

        this.setLoading(true);
        const formData = this.getFormData();

        try {
            const result = await this.sendToWebhook(formData);
            
            this.showGlobalMessage(
                result.message || this.options.successMessage, 
                'success'
            );
            this.form.reset();
            
            if (this.options.validateFields) {
                const inputs = this.form.querySelectorAll('input');
                inputs.forEach(input => this.clearFieldError(input));
            }

            this.form.dispatchEvent(new CustomEvent('formSuccess', { detail: formData }));
            
        } catch (error) {
            console.error('Erro no envio:', error);
            
            this.showGlobalMessage(
                `${this.options.errorMessage} ${error.message}`,
                'error'
            );
            
            this.form.dispatchEvent(new CustomEvent('formError', { detail: { error, data: formData } }));
            
        } finally {
            this.setLoading(false);
        }
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    const formHandler = new FormHandler('contactForm', {
        webhookUrl: 'http://localhost:5678/webhook-test/formulario-overclick', // PRODUÇÃO
        successMessage: '✅ Dados enviados com sucesso!',
        errorMessage: '❌ Falha no envio. Por favor, tente novamente.',
        validateFields: true
    });

    window.formHandler = formHandler;
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormHandler;
}