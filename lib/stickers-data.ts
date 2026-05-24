import { Sticker, StickerCategory } from '@/types';

const playersByTeam: Record<string, string[]> = {
  'USA': ['Turner', 'Zimmermann', 'Long', 'Robinson', 'Dest', 'Adams', 'McKennie', 'Musah', 'Reyna', 'Pulisic', 'Weah'],
  'Canada': ['Borjan', 'Johnston', 'Miller', 'Vitoria', 'Buchanan', 'Eustáquio', 'Laryea', 'Davies', 'David', 'Hoilett', 'Osorio'],
  'Mexico': ['Ochoa', 'Sánchez', 'Moreno', 'Montes', 'Gallardo', 'Herrera', 'Rodríguez', 'Guardado', 'Lozano', 'Jiménez', 'Martín'],
  'Argentina': ['Martínez', 'Romero', 'Otamendi', 'Tagliafico', 'Molina', 'De Paul', 'Fernández', 'Mac Allister', 'Di María', 'Messi', 'Álvarez'],
  'Chile': ['Bravo', 'Maripán', 'Medel', 'Isla', 'Pulgar', 'Vidal', 'Aranguiz', 'Valdivia', 'Alexis Sánchez', 'Vargas', 'Brereton'],
  'Brazil': ['Alisson', 'Militão', 'Marquinhos', 'Alex Sandro', 'Danilo', 'Casemiro', 'Paquetá', 'Fred', 'Raphinha', 'Neymar', 'Vinícius Jr'],
  'France': ['Lloris', 'Varane', 'Upamecano', 'Hernández', 'Pavard', 'Tchouaméni', 'Rabiot', 'Griezmann', 'Coman', 'Benzema', 'Mbappé'],
  'England': ['Pickford', 'Stones', 'Maguire', 'Trippier', 'Shaw', 'Rice', 'Bellingham', 'Henderson', 'Saka', 'Kane', 'Sterling'],
  'Spain': ['Unai Simón', 'Eric García', 'Laporte', 'Alba', 'Azpilicueta', 'Busquets', 'Gavi', 'Pedri', 'Olmo', 'Torres', 'Morata'],
  'Germany': ['Neuer', 'Rüdiger', 'Schlotterbeck', 'Raum', 'Kimmich', 'Goretzka', 'Müller', 'Musiala', 'Gnabry', 'Werner', 'Havertz'],
  'Portugal': ['Rui Patrício', 'Pepe', 'Dias', 'Guerreiro', 'Cancelo', 'Moutinho', 'B. Fernandes', 'Carvalho', 'B. Silva', 'Ronaldo', 'Leão'],
  'Netherlands': ['Flekken', 'De Ligt', 'Ake', 'Blind', 'Dumfries', 'De Roon', 'De Jong', 'Koopmeiners', 'Bergwijn', 'Depay', 'Gakpo'],
  'Belgium': ['Courtois', 'Vertonghen', 'Alderweireld', 'Theate', 'Castagne', 'Witsel', 'Tielemans', 'De Bruyne', 'Mertens', 'Lukaku', 'Hazard'],
  'Croatia': ['Livaković', 'Vida', 'Lovren', 'Gvardiol', 'Jurić', 'Brozović', 'Modrić', 'Kovačić', 'Perišić', 'Kramarić', 'Pašalić'],
  'Japan': ['Gonda', 'Yoshida', 'Tomiyasu', 'Nagatomo', 'Sakai', 'Endo', 'Kamada', 'Tanaka', 'Minamino', 'Doan', 'Asano'],
  'Morocco': ['Bono', 'Hakimi', 'Aguerd', 'Saiss', 'Mazraoui', 'Amrabat', 'Ounahi', 'Ziyech', 'En-Nesyri', 'Boufal', 'Aboukhlal'],
  'Senegal': ['Mendy', 'Koulibaly', 'Diallo', 'Sabaly', 'Kouyaté', 'Gueye', 'Mendy F.', 'Diatta', 'Mané', 'Dia', 'Sarr'],
  'Australia': ['Ryan', 'Rowles', 'Souttar', 'Behich', 'Atkinson', 'Mooy', 'McGree', 'Irvine', 'Leckie', 'Maclaren', 'Duke'],
  'South Korea': ['Seung-gyu', 'Young-gwon', 'Min-jae', 'Jin-su', 'Moon-hwan', 'In-beom', 'Woo-young', 'Jae-sung', 'Heung-min', 'Gue-sung', 'Chang-hoon'],
  'Iran': ['Beiranvand', 'Mohammadi', 'Hosseini', 'Cheshmi', 'Rezaeian', 'Noorollahi', 'Ebrahimi', 'Ezatolahi', 'Jahanbakhsh', 'Taremi', 'Azmoun'],
  'Saudi Arabia': ['Al-Owais', 'Al-Amri', 'Al-Tambakti', 'Al-Shahrani', 'Al-Ghannam', 'Al-Malki', 'Al-Dawsari', 'Al-Faraj', 'Al-Shehri', 'Al-Buraikan', 'Kanno'],
  'Ecuador': ['Domínguez', 'Hincapié', 'Torres', 'Estupiñán', 'Preciado', 'Gruezo', 'Méndez', 'Sarmiento', 'Caicedo', 'Plata', 'Valencia'],
  'Uruguay': ['Muslera', 'Giménez', 'Godín', 'Viña', 'Nández', 'Torreira', 'Bentancur', 'Valverde', 'Arrascaeta', 'Suárez', 'Cavani'],
  'Switzerland': ['Sommer', 'Akanji', 'Elvedi', 'Rodriguez', 'Widmer', 'Freuler', 'Zakaria', 'Xhaka', 'Shaqiri', 'Seferovic', 'Embolo'],
  'Colombia': ['Vargas', 'Cuesta', 'Mina', 'Mojica', 'Muñoz', 'Lerma', 'Barrios', 'Cuadrado', 'James', 'Falcao', 'Díaz'],
  'Nigeria': ['Uzoho', 'Troost-Ekong', 'Omeruo', 'Zaidu', 'Aina', 'Ndidi', 'Aribo', 'Iwobi', 'Simon', 'Osimhen', 'Lookman'],
  'Poland': ['Szczęsny', 'Bednarek', 'Glik', 'Bereszyński', 'Cash', 'Krychowiak', 'Zieliński', 'Szymański', 'Frankowski', 'Lewandowski', 'Świderski'],
  'Italy': ['Donnarumma', 'Bonucci', 'Chiellini', 'Spinazzola', 'Di Lorenzo', 'Jorginho', 'Barella', 'Verratti', 'Pellegrini', 'Raspadori', 'Immobile'],
  'Serbia': ['Rajković', 'Milenković', 'Pavlović', 'Mladenović', 'Lazović', 'Gudelj', 'Lukić', 'Milinković-Savić', 'Živković', 'Mitrović', 'Vlahović'],
  'Tunisia': ['Dahmen', 'Talbi', 'Meriah', 'Drager', 'Haisem', 'Skhiri', 'Laïdouni', 'Ben Romdhane', 'Msakni', 'Khazri', 'Jaziri'],
};

// Past World Cup Champions (trophy stickers / legend cards)
const PAST_CHAMPIONS = [
  { year: 2022, team: 'Argentina', captain: 'Lionel Messi' },
  { year: 2018, team: 'France', captain: 'Hugo Lloris' },
  { year: 2014, team: 'Germany', captain: 'Philipp Lahm' },
  { year: 2010, team: 'Spain', captain: 'Iker Casillas' },
  { year: 2006, team: 'Italy', captain: 'Fabio Cannavaro' },
  { year: 2002, team: 'Brazil', captain: 'Cafu' },
  { year: 1998, team: 'France', captain: 'Didier Deschamps' },
  { year: 1994, team: 'Brazil', captain: 'Romário' },
];

export function generateStickers(): Sticker[] {
  const stickers: Sticker[] = [];
  let number = 1;

  // ── COVER / INTRO ──────────────────────────────────────────
  const covers = [
    'Official Album Cover',
    'FIFA World Cup Trophy',
    'Panini WC 2026 Logo',
    'Host Cities — USA',
    'Host Cities — Canada',
    'Host Cities — Mexico',
    'Welcome to 2026',
    'FIFA Official Logo',
    'Tournament Map',
    'Road to the Final',
  ];
  covers.forEach(name => {
    stickers.push({ id: `sticker_${number}`, number, name, team: 'FIFA', category: 'cover', section: 'Introduction' });
    number++;
  });

  // ── LOGOS ──────────────────────────────────────────────────
  const logos = [
    'FIFA World Cup 2026 Logo',
    'Panini Official Logo',
    'FIFA Official Emblem',
    'USA 2026 Host Logo',
    'Canada 2026 Host Logo',
    'Mexico 2026 Host Logo',
  ];
  logos.forEach(name => {
    stickers.push({ id: `sticker_${number}`, number, name, team: 'FIFA', category: 'logo', section: 'Logos' });
    number++;
  });

  // ── PAST CHAMPIONS ─────────────────────────────────────────
  PAST_CHAMPIONS.forEach(ch => {
    stickers.push({
      id: `sticker_${number}`, number,
      name: `${ch.team} ${ch.year} Champions`,
      team: ch.team,
      category: 'past_champion',
      section: 'Past Champions',
    });
    number++;
    stickers.push({
      id: `sticker_${number}`, number,
      name: `${ch.captain} — ${ch.year} Legend`,
      team: ch.team,
      category: 'past_champion',
      section: 'Past Champions',
    });
    number++;
  });

  // ── STADIUMS ───────────────────────────────────────────────
  const stadiums = [
    { name: 'MetLife Stadium', team: 'USA' },
    { name: 'AT&T Stadium', team: 'USA' },
    { name: 'SoFi Stadium', team: 'USA' },
    { name: 'Levi\'s Stadium', team: 'USA' },
    { name: 'Arrowhead Stadium', team: 'USA' },
    { name: 'BC Place', team: 'Canada' },
    { name: 'BMO Field', team: 'Canada' },
    { name: 'Stade Olympique', team: 'Canada' },
    { name: 'Estadio Azteca', team: 'Mexico' },
    { name: 'Estadio BBVA', team: 'Mexico' },
    { name: 'Estadio Akron', team: 'Mexico' },
  ];
  stadiums.forEach(s => {
    stickers.push({ id: `sticker_${number}`, number, name: s.name, team: s.team, category: 'stadium', section: 'Stadiums' });
    number++;
  });

  // ── TEAMS ──────────────────────────────────────────────────
  const allTeams = Object.keys(playersByTeam);
  allTeams.forEach(team => {
    // Team badge / logo
    stickers.push({ id: `sticker_${number}`, number, name: `${team} — Club Badge`, team, category: 'team_badge', section: team });
    number++;

    // Team photo / group shot
    stickers.push({ id: `sticker_${number}`, number, name: `${team} — Official Team Photo`, team, category: 'team_photo', section: team });
    number++;

    // Players
    const players = playersByTeam[team] || [];
    players.forEach(player => {
      stickers.push({ id: `sticker_${number}`, number, name: player, team, category: 'player', section: team });
      number++;
    });
  });

  return stickers;
}

export const STICKERS: Sticker[] = generateStickers();
export const TOTAL_STICKERS = STICKERS.length;
export const TEAMS = [...new Set(STICKERS.map(s => s.team).filter(t => t !== 'FIFA'))].sort();

export const CATEGORY_LABELS: Record<string, string> = {
  player: 'Players',
  team_badge: 'Team Badges',
  team_photo: 'Team Photos',
  logo: 'Logos',
  stadium: 'Stadiums',
  cover: 'Intro / Covers',
  past_champion: 'Past Champions',
  special: 'Special',
  group: 'Squad',
};

export const CATEGORY_ICONS: Record<string, string> = {
  player: '👤',
  team_badge: '🛡️',
  team_photo: '📸',
  logo: '🔵',
  stadium: '🏟️',
  cover: '📖',
  past_champion: '🏆',
  special: '⭐',
  group: '👥',
};

export const ALL_CATEGORIES = [
  'player', 'team_badge', 'team_photo', 'logo', 'stadium', 'cover', 'past_champion',
] as const;

export function getStickersByTeam(team: string): Sticker[] {
  return STICKERS.filter(s => s.team === team);
}

export function getStickerById(id: string): Sticker | undefined {
  return STICKERS.find(s => s.id === id);
}
