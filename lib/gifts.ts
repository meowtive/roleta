export const GIFTS = [
  "Frigideira antiaderente",
  "Panela pequena",
  "Leiteira",
  "Forma de bolo",
  "Assadeira",
  "Refratário de vidro",
  "Escorredor de macarrão",
  "Escorredor de arroz",
  "Tábua de corte (Madeira ou Vidro)",
  "Peneira",
  "Ralador",
  "Espremedor de limão",
  "Abridor de latas",
  "Abridor de garrafas",
  "Descascador de legumes",
  "Pegador de massa",
  "Concha",
  "Espátula",
  "Colher de pau/silicone",
  "Pegador de alimentos",
  "Tesoura de cozinha",
  "Jogo de pratos",
  "Bowls/tigelas",
  "Copos",
  "Taças",
  "Canecas",
  "Jogo de talheres",
  "Travessas",
  "Saladeira",
  "Jarra para água/suco",
  "Açucareiro",
  "Potes para servir",
  "Potes herméticos",
  "Potes para guardar comida na geladeira",
  "Porta-temperos",
  "Organizador de gaveta",
  "Escorredor de louça",
  "Porta-detergente",
  "Lixeira para cozinha",
  "Manteigueira",
  "Panos de prato",
  "Panos de microfibra",
  "Luvas de limpeza",
  "Esponjas",
  "Escovinha para louça",
  "Rodo de pia",
  "Escorredor de talheres",
  "Lixeira",
  "Tapete para cozinha",
  "Saleiro",
  "Pimenteiro",
  "Descanso de panela",
  "Pegador de panela",
  "Avental",
  "Luva térmica",
  "Prendedores para embalagens",
] as const;

export type Gift = (typeof GIFTS)[number];

const WHEEL_SLICES = 24;

export function visualGifts(all: string[], winner?: string | null) {
  if (all.length === 0) {
    return winner ? [winner] : [];
  }

  if (all.length <= WHEEL_SLICES) {
    if (winner && !all.includes(winner)) {
      return [winner, ...all].slice(0, WHEEL_SLICES);
    }

    return all;
  }

  const picked: string[] = [];
  const used = new Set<string>();

  for (let index = 0; index < WHEEL_SLICES; index += 1) {
    const item = all[Math.floor((index * all.length) / WHEEL_SLICES)];

    if (!used.has(item)) {
      picked.push(item);
      used.add(item);
    }
  }

  for (const item of all) {
    if (picked.length >= WHEEL_SLICES) {
      break;
    }

    if (!used.has(item)) {
      picked.push(item);
      used.add(item);
    }
  }

  if (winner && !used.has(winner) && picked.length > 0) {
    picked[picked.length - 1] = winner;
  }

  return picked;
}
