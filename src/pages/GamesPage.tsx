import { useState } from "react";
import AppIcon from "../components/AppIcon";
import {
  AppShell,
  LockedCard,
  PageHeader,
} from "../components/AppShell";
import Toast from "../components/Toast";

const games = [
  ["Contra o tempo", "Responda rápido antes do relógio zerar."],
  ["Memória", "Encontre os pares em inglês e português."],
  ["Palavras embaralhadas", "Reconstrua cada palavra na ordem certa."],
  ["Verdadeiro ou falso", "Decida se a afirmação está correta."],
  ["Descubra a palavra", "Use a tradução e as letras reveladas."],
  ["Soletrando", "Escreva a palavra indicada sem ajuda."],
];

export default function GamesPage() {
  const [notice, setNotice] = useState("");
  function showNotice(title: string) {
    setNotice(`${title} estará disponível em breve.`);
    window.setTimeout(() => setNotice(""), 2200);
  }

  return (
    <AppShell className="standard-page">
      <PageHeader backTo="/" title="Jogos" />
      <section className="page-lead compact">
        <span className="eyebrow">Jogos rápidos</span>
        <h2>Mais maneiras de praticar</h2>
        <p>Conheça os desafios que vão trazer novos ritmos para a prática.</p>
      </section>
      <div className="games-page-list">
        {games.map(([title, description], index) => (
          <div className="game-list-row" key={title}>
            <span className="game-list-icon">
              <AppIcon name={index % 2 === 0 ? "game" : "grid"} />
            </span>
            <LockedCard
              description={description}
              onClick={() => showNotice(title)}
              title={title}
            />
          </div>
        ))}
      </div>
      <Toast message={notice} />
    </AppShell>
  );
}
