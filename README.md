# Octop Chat Widget

Widget de chat embedável standalone para o sistema Octop.

**Este é APENAS o widget** - um arquivo JavaScript que será carregado nos sites dos clientes.

## 📦 Arquitetura

```
┌─────────────────────┐      ┌─────────────────────┐
│   Backend (NestJS)  │      │  Widget (este repo) │
│  api.octolk.com     │◄─────┤ widget.octolk.com   │
│                     │      │                     │
│  • API REST         │      │  • widget.js        │
│  • PostgreSQL       │      │  • Hospedado Vercel │
│  • Gera script      │      └─────────────────────┘
└─────────────────────┘               │
         ▲                            │
         │                            │
         └────────────────────────────┘
              Site do Cliente
           (cola o script inline)
```
**backend** gera um script inline com todas as configurações:

```html
<!-- Octolk Chat Widget -->
<script>
  (function() {
    window.OctolkChatConfig = {
      embedKey: 'emb_484aabff48ebc3dc6e0411d2eff3d12a',
      apiUrl: 'https://api.octolk.com',        // ← Backend (API)
      title: 'Atendimento',
      subtitle: 'Online agora',
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
      avatarUrl: '',
      welcomeMessage: 'Olá! Como posso ajudar?'
    };
    
    var script = document.createElement('script');
    script.src = 'https://widget.octolk.com/widget.js';  // ← Widget (este projeto)
    script.async = true;
    document.head.appendChild(script);
  })();
</script>
<!-- End Octolk Chat Widget -->
```

### Fluxo:
1. **Backend** gera o script com configs (embedKey, cores, textos)
2. **Cliente** cola o script no site dele
3. Script carrega o `widget.js` da **Vercel**
4. Widget faz chamadas de API para o **Backend**

## 📦 Instalação no Site do Cliente

O script gerado pelo backend já vem com todas as configurações. O cliente só precisa colar no site:

```html
<!-- Octolk Chat Widget -->
<script>
  (function() {
    window.OctolkChatConfig = {
      embedKey: 'emb_484aabff48ebc3dc6e0411d2eff3d12a',
      apiUrl: 'https://api.seudominio.com',
      title: 'Atendimento',
      subtitle: 'Online agora',
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
      avatarUrl: '',
      welcomeMessage: 'Olá! Como posso ajudar?'
    };
    
    var script = document.createElement('script');
    script.src = 'https://api.seudominio.com/static/embed/widget.js';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>
<!-- End Octolk Chat Widget -->
```

> **Nota**: Todas as configurações (cores, textos, avatar) já vêm do backend. O widget não precisa fazer chamada adicional para buscar configs.

## 🔧 Tecnologias

- TypeScript
- Vi� Deploy (Vercel)

```bash
# Build
npm run build

# Deploy na Vercel
vercel --prod
```

O `widget.js` ficará disponível em: `https://seu-projeto.vercel.app/widget.js`

### Configurar no Backend

Depois do deploy, configure a URL do widget no backend:

```typescript
// Backend: gerar script de instalação
const widgetUrl = 'https://seu-widget.vercel.app/widget.js';
const backendUrl = 'https://api.octolk.com';
```
- Axios
- Vanilla JS/CSS

## 📝 Comandos Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Pré-visualiza build de produção
- `npm run type-check` - Verifica tipos TypeScript

## 🎨 Customização

O widget suporta customização de cores via API do backend. Configure no painel admin do Octop:

- Cor primária
- Cor secundária
- Avatar do agente
- Título e subtítulo
- Mensagem de boas-vindas

## 📊 Tamanho do Bundle

Bundle minificado: ~40-60KB (3-5x menor que Next.js)