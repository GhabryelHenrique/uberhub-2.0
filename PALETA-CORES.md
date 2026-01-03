# 🎨 Paleta de Cores Roxa - #6610f2

## Tema Claro

### Cores Principais
```css
--primary-color: #6610f2      /* Roxo principal */
--primary-dark: #5209c7       /* Roxo escuro */
--primary-light: #8540f5      /* Roxo claro */
--primary-lighter: #a370f7    /* Roxo muito claro */
--primary-pale: #d4b5fd       /* Roxo pálido */
```

### Cores Secundárias
```css
--secondary-color: #7c3aed    /* Roxo violeta */
--accent-color: #a78bfa       /* Lavanda */
--accent-light: #c4b5fd       /* Lavanda claro */
```

### Backgrounds
```css
--bg-primary: #faf8ff         /* Branco com toque roxo */
--bg-secondary: #ffffff       /* Branco puro */
--bg-tertiary: #f5f3ff        /* Roxo muito claro */
--bg-card: #ffffff            /* Cards brancos */
--bg-hover: #f5f3ff           /* Hover roxo suave */
--bg-input: #ffffff           /* Inputs brancos */
--bg-purple-light: #ede9fe    /* Roxo ultra claro para destaques */
```

### Borders
```css
--border-color: #e9d5ff       /* Borda roxa clara */
--border-hover: #d8b4fe       /* Borda roxa hover */
--border-focus: #c4b5fd       /* Borda roxa focus */
```

### Textos
```css
--text-primary: #1e1b4b       /* Roxo escuro para texto */
--text-secondary: #4c1d95     /* Roxo médio para texto */
--text-tertiary: #7c3aed      /* Roxo claro para texto */
--text-muted: #a78bfa         /* Roxo pálido para texto */
--text-inverse: #ffffff       /* Branco */
```

### Gradientes
```css
--gradient-primary: linear-gradient(135deg, #6610f2 0%, #8540f5 100%)
--gradient-secondary: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)
--gradient-soft: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)
```

---

## Tema Escuro

### Cores Principais
```css
--primary-color: #8540f5      /* Roxo mais claro para contraste */
--primary-dark: #6610f2       /* Roxo médio */
--primary-light: #a370f7      /* Roxo claro */
--primary-lighter: #c4b5fd    /* Roxo muito claro */
--primary-pale: #d4b5fd       /* Roxo pálido */
```

### Cores Secundárias
```css
--secondary-color: #a78bfa    /* Lavanda */
--accent-color: #c4b5fd       /* Lavanda clara */
--accent-light: #ddd6fe       /* Lavanda muito clara */
```

### Backgrounds
```css
--bg-primary: #0f0a1e         /* Roxo escuro profundo */
--bg-secondary: #1a1333       /* Roxo escuro médio */
--bg-tertiary: #251c47        /* Roxo escuro claro */
--bg-card: #1a1333            /* Cards roxos escuros */
--bg-hover: #251c47           /* Hover roxo escuro */
--bg-input: #1a1333           /* Inputs roxos escuros */
--bg-purple-dark: #2d2057     /* Roxo escuro para destaques */
```

### Borders
```css
--border-color: #3d2d6b       /* Borda roxa */
--border-hover: #4c3a82       /* Borda roxa hover */
--border-focus: #6610f2       /* Borda roxa focus */
```

### Textos
```css
--text-primary: #f5f3ff       /* Branco com toque roxo */
--text-secondary: #d4b5fd     /* Roxo claro */
--text-tertiary: #a78bfa      /* Roxo médio */
--text-muted: #7c3aed         /* Roxo escuro para texto */
--text-inverse: #0f0a1e       /* Roxo muito escuro */
```

### Gradientes
```css
--gradient-primary: linear-gradient(135deg, #6610f2 0%, #8540f5 100%)
--gradient-secondary: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)
--gradient-dark: linear-gradient(135deg, #1a1333 0%, #251c47 100%)
```

---

## Estados (Ambos Temas)

### Tema Claro
```css
--success: #10b981    /* Verde */
--warning: #f59e0b    /* Amarelo/Laranja */
--error: #ef4444      /* Vermelho */
--info: #3b82f6       /* Azul */
```

### Tema Escuro
```css
--success: #34d399    /* Verde mais claro */
--warning: #fbbf24    /* Amarelo mais claro */
--error: #f87171      /* Vermelho mais claro */
--info: #60a5fa       /* Azul mais claro */
```

---

## Como Usar

### Em CSS/SCSS
```scss
.meu-componente {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-color);

  &:hover {
    background: var(--bg-hover);
    border-color: var(--border-hover);
  }
}

.botao-principal {
  background: var(--gradient-primary);
  color: var(--text-inverse);
  box-shadow: var(--shadow-purple);
}
```

### Alternância Automática
Todas as variáveis mudam automaticamente quando você clica no botão de tema (sol/lua) na navbar!

---

## Visualização de Cores

### Tema Claro - Principais
- 🟣 **#6610f2** - Primary (Roxo vibrante)
- 🟣 **#5209c7** - Primary Dark (Roxo escuro)
- 🟪 **#8540f5** - Primary Light (Roxo claro)
- 🟪 **#a370f7** - Primary Lighter (Roxo muito claro)
- 💜 **#d4b5fd** - Primary Pale (Roxo pálido)

### Tema Escuro - Backgrounds
- ⬛ **#0f0a1e** - BG Primary (Roxo escuro profundo)
- ⬛ **#1a1333** - BG Secondary (Roxo escuro médio)
- ⬛ **#251c47** - BG Tertiary (Roxo escuro claro)

---

## Características da Paleta

✨ **Tema Claro:**
- Fundo branco/roxo muito claro para não cansar os olhos
- Texto roxo escuro para alto contraste
- Acentos roxos vibrantes para CTAs
- Sombras com toque roxo sutil

🌙 **Tema Escuro:**
- Backgrounds em tons de roxo escuro (não cinza!)
- Texto claro com toque roxo
- Acentos roxos brilhantes que "brilham"
- Sombras com brilho roxo para profundidade

🎯 **Ambos:**
- Acessibilidade WCAG AA/AAA
- Contraste adequado entre texto e fundo
- Gradientes suaves e harmoniosos
- Transições suaves entre temas
