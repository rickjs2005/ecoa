import { randomInt } from "node:crypto";

/**
 * Palavras pt-BR comuns e concretas para a frase de recuperação.
 * Regras: 4–8 letras, sem acento e sem cedilha (fáceis de digitar em
 * qualquer teclado), todas distintas.
 * 6 palavras sorteadas de 240 ≈ 47 bits de entropia (+ bcrypt no banco).
 */
export const WORDLIST: string[] = [
  // natureza
  "areia", "praia", "chuva", "vento", "pedra",
  "monte", "campo", "folha", "terra", "lago",
  "fonte", "chama", "brasa", "cinza", "nuvem",
  "bruma", "geada", "orvalho", "neve", "gelo",
  // paisagem
  "fogo", "serra", "colina", "duna", "ilha",
  "costa", "onda", "espuma", "concha", "coral",
  "selva", "bosque", "floresta", "caverna", "gruta",
  "rocha", "trilha", "riacho", "cascata", "deserto",
  // ceu e tempo
  "astro", "estrela", "cometa", "planeta", "eclipse",
  "meteoro", "aurora", "raio", "poente", "noite",
  "tarde", "inverno", "outono", "granizo", "farol",
  "torre", "moinho", "ponte", "porto", "aldeia",
  // plantas
  "flor", "galho", "tronco", "raiz", "semente",
  "broto", "trigo", "milho", "arroz", "aveia",
  "cacau", "bambu", "palha", "rosa", "tulipa",
  "girassol", "jasmim", "lavanda", "musgo", "cacto",
  // arvores e bichos
  "pinheiro", "carvalho", "figueira", "palmeira", "videira",
  "tigre", "lobo", "urso", "raposa", "coelho",
  "veado", "arara", "tucano", "coruja", "pomba",
  "pato", "ganso", "cisne", "peixe", "baleia",
  // bichos
  "golfinho", "foca", "polvo", "lula", "formiga",
  "abelha", "besouro", "grilo", "cigarra", "sapo",
  "cobra", "lagarto", "cavalo", "vaca", "touro",
  "ovelha", "cabra", "porco", "galinha", "bode",
  // mais bichos
  "zebra", "girafa", "elefante", "macaco", "gorila",
  "panda", "camelo", "esquilo", "castor", "lontra",
  "gato", "tatu", "pinguim", "gaivota", "pardal",
  "porta", "janela", "chave", "mesa", "cadeira",
  // casa
  "cama", "tapete", "quadro", "espelho", "copo",
  "prato", "garfo", "colher", "panela", "forno",
  "balde", "escova", "pente", "toalha", "manta",
  "camisa", "sapato", "bota", "luva", "gorro",
  // objetos
  "cinto", "bolsa", "mochila", "carteira", "moeda",
  "papel", "caneta", "caderno", "livro", "jornal",
  "carta", "envelope", "tesoura", "fita", "corda",
  "martelo", "tijolo", "telhado", "tinta", "pincel",
  // mais objetos
  "vela", "abajur", "sino", "tambor", "flauta",
  "viola", "piano", "mapa", "globo", "remo",
  "barco", "navio", "trem", "roda", "pipa",
  "bola", "caneca", "garrafa", "lanterna", "agulha",
  // comida
  "bolo", "torta", "doce", "cebola", "tomate",
  "batata", "pepino", "alface", "couve", "banana",
  "goiaba", "manga", "abacaxi", "caju", "coco",
  "laranja", "morango", "cereja", "queijo", "leite",
  // lugares e afetos
  "casa", "quintal", "jardim", "horta", "cidade",
  "bairro", "vila", "fazenda", "escola", "teatro",
  "mercado", "padaria", "sonho", "festa", "poema",
  "risada", "beijo", "carinho", "amigo", "viagem",
];

const PHRASE_WORDS = 6;

/** Sorteia 6 palavras distintas com CSPRNG e une por espaço. */
export function generatePhrase(): string {
  const pool = [...WORDLIST];
  const words: string[] = [];
  for (let i = 0; i < PHRASE_WORDS; i++) {
    const idx = randomInt(pool.length);
    words.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return words.join(" ");
}
