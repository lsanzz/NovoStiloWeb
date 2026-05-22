# Como rodar no Windows

1. Extraia este ZIP fora do OneDrive, por exemplo em `C:\Projetos\Barber`.
2. Abra o PowerShell nessa pasta.
3. Rode:

```powershell
npm install
npm run dev
```

Depois abra o endereço que aparecer no terminal, normalmente:

```txt
http://localhost:5173
```

Se o npm mostrar `Exit handler never called`, o problema é no npm/cache local. Rode:

```powershell
npm cache clean --force
npm install -g npm@10.9.2
npm install
npm run dev
```

Esta versão é uma SPA Vite enxuta, sem dependências de servidor/SSR e sem dependências do gerador original.
