const DOMINIO_BASE = 'books.toscrape.com';

async function buscarHTML(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Falha ao buscar HTML de ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

function extrairLinks(html) {
  const regex = /href\s*=\s*(["'])(.*?)\1/gi;
  const links = [];
  let match;

  while ((match = regex.exec(html)) !== null) {
    const link = match[2].trim();
    if (!link || link.startsWith('#') || link.toLowerCase().startsWith('javascript:') || link.toLowerCase().startsWith('mailto:')) {
      continue;
    }
    links.push(link);
  }

  return links;
}

function classificarLinks(links, dominio) {
  const internos = [];
  const externos = [];

  for (const link of links) {
    const isAbsolute = /^https?:\/\//i.test(link);
    if (link.startsWith('/') || link.includes(dominio) || !isAbsolute) {
      internos.push(link);
    } else {
      externos.push(link);
    }
  }

  return { internos, externos };
}

async function main() {
  try {
    const urlBase = `https://${DOMINIO_BASE}`;
    const html = await buscarHTML(urlBase);
    const links = extrairLinks(html);
    const { internos, externos } = classificarLinks(links, DOMINIO_BASE);

    console.log(`=== Links Internos: ${internos.length} ===`);
    internos.forEach(link => console.log(link));
    console.log(`\n=== Links Externos: ${externos.length} ===`);
    externos.forEach(link => console.log(link));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

main();