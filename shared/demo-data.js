// Demo data shared by the server seed (SQLite) and the browser adapter (localStorage).
// Keep this file free of Node or browser specific code.

// [login, program, cohort, level, levelProgress, campus, skills]
export const demoUsers = [
  ['mageneus', 'Core program', '26_04_TAS', 7, 78, '21 Tashkent', ['Vue', 'JavaScript', 'Rails', 'PostgreSQL', 'Figma']],
  ['zephyrus', 'Core program', '26_04_TAS', 8, 12, '21 Tashkent', ['Rails', 'PostgreSQL']],
  ['ferrisfan', 'Core program', '25_11_TAS', 9, 40, '21 Tashkent', ['Rust', 'Python']],
  ['pixelkat', 'Core program', '26_04_TAS', 5, 60, '21 Tashkent', ['Figma', 'User research']],
  ['catan_master', 'Core program', '25_06_TAS', 11, 5, '21 Tashkent', ['Product']],
  ['tmuxlover', 'Core program', '25_06_TAS', 10, 90, '21 Tashkent', ['React Native', 'JavaScript']],
  ['dijkstra_21', 'Core program', '25_11_TAS', 9, 33, '21 Tashkent', ['Vue', 'Node.js']],
  ['gopher_x', 'Core program', '26_04_TAS', 6, 70, '21 Tashkent', ['Go']],
  ['segfault_hunter', 'Core program', '25_06_TAS', 12, 20, '21 Tashkent', ['C', 'Rust']],
  ['nodeknight', 'Core program', '25_11_TAS', 8, 50, '21 Tashkent', ['Node.js']],
  ['sally_ui', 'Core program', '26_04_TAS', 6, 15, '21 Tashkent', ['UI design', 'Figma']],
  ['ops_guy', 'Core program', '25_06_TAS', 10, 44, '21 Tashkent', ['DevOps']],
  ['cron_cat', 'Core program', '26_04_TAS', 7, 22, '21 Tashkent', ['Express']],
  ['rusty_nail', 'Core program', '25_11_TAS', 9, 61, '21 Tashkent', ['Rust']],
  ['docwriter', 'Core program', '26_04_TAS', 5, 80, '21 Tashkent', ['Writing']],
  ['ci_wizard', 'Core program', '25_06_TAS', 11, 35, '21 Tashkent', ['DevOps', 'GitLab CI']],
]

// [title, topic, description, place, startOffsetMinutes (relative to "now"), duration, capacity, hostLogin, memberLogins]
export const demoMeetups = [
  ['Pet project ideas: what to build next?', 'Ideas', 'Bring an idea, get feedback in 5 minutes. No slides, just talk.', 'Kitchen, 2nd floor', -12, 45, 8, 'zephyrus', ['pixelkat', 'catan_master', 'tmuxlover', 'sally_ui']],
  ['Rust vs C: memory safety chat', 'Tech talk', 'Casual talk for people who finished C projects and are curious about Rust.', 'Cluster 3, table 14', -25, 60, 6, 'ferrisfan', ['rusty_nail', 'segfault_hunter']],
  ['Coffee & new faces', 'Chill', 'New in campus? Come say hi. Zero agenda, just meeting people.', 'Coworking near the entrance', -4, 30, 10, 'mageneus', ['nodeknight']],
  ['Algorithms study group: graphs', 'Study group', 'BFS, DFS, Dijkstra. Bring your laptop.', 'Cluster 1', 75, 60, 8, 'dijkstra_21', []],
  ['Show your terminal setup', 'Tech talk', 'tmux, neovim, dotfiles. Show and tell.', 'Kitchen, 2nd floor', 160, 45, 12, 'tmuxlover', ['ci_wizard']],
  ['Board games after deadline', 'Chill', 'Catan, Codenames, and whatever you bring.', 'Lounge', 280, 90, 10, 'catan_master', ['sally_ui', 'ops_guy']],
]

// posts: [authorLogin, title, text, comments, createdAt, likes]
// roadmap: [title, date, status, text]
// updates: [date, text]
export const demoStartups = [
  {
    slug: 'peerdesk', name: 'PeerDesk', color: '#25c1cb', logo: 'PD', stage: 'MVP', started: 'March 2026',
    pitch: 'Find a free desk in any cluster in real time. No more walking around campus.',
    description: 'PeerDesk shows a live map of the campus with free and taken desks. Students check in with their badge, and the map updates in seconds. The goal is to save the 10–15 minutes people spend every day walking between clusters to find a place.',
    problem: 'On busy days it is hard to find a free desk. People walk from cluster to cluster, and lose focus before they even start.',
    solution: 'A live map of desks with check-in via the campus badge, plus a "find me a desk near my friends" button.',
    stack: ['Vue', 'Rails', 'PostgreSQL'],
    members: [['mageneus', 'Founder · Frontend', 1], ['zephyrus', 'Co-founder · Backend', 1], ['pixelkat', 'UX research', 0]],
    roles: [
      ['Backend dev', 'Rails or Node. Help us with the check-in API and WebSocket updates.', ['Rails', 'Node.js', 'WebSocket', 'PostgreSQL']],
      ['Designer', 'Map UI, empty states, and a small design system.', ['Figma', 'UI design']],
    ],
    links: [['GitLab', 'https://gitlab.com'], ['Demo', 'https://example.com']],
    posts: [
      ['mageneus', 'Why we killed the "reserve a desk" feature', 'In the first prototype you could reserve a desk for 30 minutes. It felt smart, but in tests people reserved desks and never came. We removed it. Now the map only shows real presence from badge check-ins, and the data became honest again.', 6, '2026-09-11T10:00:00Z', 24],
      ['zephyrus', 'From polling to WebSocket in one evening', 'The map used to refresh every 10 seconds with a plain HTTP request. It worked, but 200 clients made the Rails server sad. I moved updates to Action Cable. Short write-up about what broke and how we fixed it.', 12, '2026-09-03T18:30:00Z', 41],
      ['pixelkat', '20 interviews, 3 surprises', 'I talked with students from three cohorts. Surprise one: nobody cares about the exact desk, they care about sitting near friends. Surprise two: the kitchen is the real "cluster zero". Surprise three: people trust the badge more than the app.', 4, '2026-08-25T12:00:00Z', 18],
    ],
    roadmap: [
      ['Idea and first interviews', 'Mar 2026', 'done', 'Problem confirmed with 20 students.'],
      ['Badge check-in prototype', 'Aug 2026', 'done', 'Check-in works on the campus turnstile.'],
      ['Live map for Cluster 1 and 2', 'Sep 2026', 'in-progress', 'Beta with 20 students, fixing WebSocket edge cases.'],
      ['All clusters + kitchen', 'Oct 2026', 'planned', 'Cover the whole campus.'],
      ['"Near my friends" button', 'Nov 2026', 'planned', 'Find a desk next to people you follow.'],
      ['Launch in 21 Moscow', 'Q1 2027', 'planned', 'Second campus, same map.'],
    ],
    updates: [['10 Sep', 'Live map works for Cluster 1 and 2. Testing with 20 students.'], ['28 Aug', 'Badge check-in prototype done.'], ['15 Mar', 'Idea presented at the campus demo day.']],
  },
  {
    slug: 'reviewmate', name: 'ReviewMate', color: '#7c46d5', logo: 'RM', stage: 'Idea', started: 'August 2026',
    pitch: 'AI helper that prepares you for peer review: checklists, common mistakes, questions.',
    description: 'ReviewMate reads the project task and your code, then builds a checklist of things a reviewer will most likely ask about. It also generates practice questions so you can prepare before the review.',
    problem: 'Many students fail peer review because of small things they could have checked in 5 minutes.',
    solution: 'A personal checklist and a short Q&A session generated from the task and the code.',
    stack: ['Python', 'FastAPI'],
    members: [['ferrisfan', 'Founder · Backend', 1]],
    roles: [
      ['Co-founder', 'Someone who loves product and talking to users.', ['Product', 'User research']],
      ['Frontend dev', 'Vue or React. Build the first UI from Figma.', ['Vue', 'React', 'JavaScript', 'Figma']],
    ],
    links: [['Notion', 'https://notion.so']],
    posts: [['ferrisfan', 'What students told me about peer review', 'Ten interviews in one week. The most common answer to "why did you fail?" was "a small thing I forgot to check". That is exactly the gap ReviewMate wants to close.', 3, '2026-08-30T09:00:00Z', 9]],
    roadmap: [['Interviews', 'Aug 2026', 'done', '10 interviews done.'], ['Checklist generator', 'Oct 2026', 'in-progress', 'First version for C projects.'], ['Practice Q&A', 'Dec 2026', 'planned', 'Short review simulation.']],
    updates: [['30 Aug', 'First 10 interviews with students done. Everyone wants it.']],
  },
  {
    slug: 'campus-eats', name: 'Campus Eats', color: '#44eb99', logo: 'CE', stage: 'Growth', started: 'November 2025',
    pitch: 'Group food orders for clusters. Split the bill, get delivery to the door.',
    description: 'Campus Eats collects orders from one cluster into a single delivery. Everyone pays their own part in the app. We work with three cafes near campus.',
    problem: 'Ordering food alone is expensive and slow. Group orders in chats are a mess.',
    solution: 'One order per cluster, automatic bill split, and one delivery to the campus entrance.',
    stack: ['React Native', 'Node.js'],
    members: [['catan_master', 'Founder · Product', 1], ['tmuxlover', 'Co-founder · Mobile', 1], ['nodeknight', 'Backend', 0], ['sally_ui', 'Design', 0], ['ops_guy', 'Operations', 0]],
    roles: [['Marketing', 'Help us reach students in other campuses.', ['Marketing', 'SMM']]],
    links: [['Website', 'https://example.com'], ['Telegram', 'https://t.me']],
    posts: [
      ['catan_master', '1,200 orders in a month: what we learned', 'Peak time is 14:00–15:00. Clusters on the 3rd floor order twice as often as the 1st floor. And yes, 40% of all orders are the same chicken wrap.', 8, '2026-09-06T14:00:00Z', 33],
      ['tmuxlover', 'Building the bill split without a payment provider', 'We started with manual transfers and a shared table. Ugly, but it let us launch two months earlier.', 5, '2026-07-20T11:00:00Z', 27],
    ],
    roadmap: [['Launch in 21 Tashkent', 'Jun 2026', 'done', 'First cafe partner.'], ['Three cafe partners', 'Sep 2026', 'done', 'More choice for lunch.'], ['In-app payments', 'Nov 2026', 'in-progress', 'Talking to two providers.'], ['Other campuses', '2027', 'planned', 'Start with 21 Kazan.']],
    updates: [['5 Sep', '1,200 orders last month. New cafe partner added.'], ['1 Jun', 'Launched in 21 Tashkent.']],
  },
  {
    slug: 'deadline-radar', name: 'Deadline Radar', color: '#3f95d2', logo: 'DR', stage: 'MVP', started: 'May 2026',
    pitch: 'Personal deadline calendar for School 21 projects with smart reminders.',
    description: 'Deadline Radar imports your project deadlines and builds a plan: what to do this week, what can wait. Reminders adapt to your real progress.',
    problem: 'Deadlines are spread across the platform. It is easy to forget one.',
    solution: 'One calendar with all deadlines and a simple weekly plan.',
    stack: ['Vue', 'Express'],
    members: [['dijkstra_21', 'Founder · Fullstack', 1], ['cron_cat', 'Backend', 0]],
    roles: [['Mobile dev', 'Build the mobile app with push notifications.', ['React Native', 'JavaScript', 'Push notifications']]],
    links: [['GitLab', 'https://gitlab.com']],
    posts: [],
    roadmap: [['Web beta', 'Sep 2026', 'done', '60 active users.'], ['Mobile app', 'Dec 2026', 'planned', 'Push reminders.']],
    updates: [['2 Sep', 'Web version in beta. 60 active users.']],
  },
  {
    slug: 'tribeboard', name: 'TribeBoard', color: '#b070ff', logo: 'TB', stage: 'Idea', started: 'September 2026',
    pitch: 'Live leaderboard and activity feed for tribe tournaments.',
    description: 'TribeBoard shows tribe points in real time, who earned them and for what. It makes the tournament visible and fun.',
    problem: 'Tribe points update once a day and nobody knows why they changed.',
    solution: 'Live feed of events and a leaderboard on the campus screens.',
    stack: ['Go', 'WebSocket'],
    members: [['gopher_x', 'Founder · Backend', 1]],
    roles: [
      ['Co-founder', 'Product person who likes gamification.', ['Product', 'Gamification']],
      ['Designer', 'Leaderboard screens for TVs in the campus.', ['UI design', 'Motion design']],
      ['Frontend dev', 'Real-time UI with WebSocket.', ['Vue', 'JavaScript', 'WebSocket']],
    ],
    links: [], posts: [], roadmap: [], updates: [],
  },
  {
    slug: 'c-lint', name: 'C-Lint', color: '#3ed9c3', logo: 'CL', stage: 'Growth', started: 'January 2026',
    pitch: 'A friendly linter for School 21 C projects with explanations of every rule.',
    description: 'C-Lint checks your C project against the School 21 style rules and explains each warning in simple words, with an example of the fix.',
    problem: 'Style errors are found late, during the review, when it hurts the most.',
    solution: 'A CLI tool and a GitLab CI job that catch style errors before the review.',
    stack: ['C', 'Rust'],
    members: [['segfault_hunter', 'Founder · Core', 1], ['rusty_nail', 'Rust dev', 0], ['docwriter', 'Docs', 0], ['ci_wizard', 'DevOps', 0]],
    roles: [],
    links: [['GitLab', 'https://gitlab.com'], ['Docs', 'https://example.com']],
    posts: [['segfault_hunter', 'Every warning should teach something', 'A linter that only says "line too long" is useless for learning. Each C-Lint rule links to a one-paragraph explanation and a before/after example.', 14, '2026-08-21T16:00:00Z', 52]],
    roadmap: [['CLI tool', 'Mar 2026', 'done', 'Covers the School 21 style guide.'], ['GitLab CI job', 'Jul 2026', 'done', 'One line in .gitlab-ci.yml.'], ['Editor plugin', 'Nov 2026', 'in-progress', 'VS Code first.']],
    updates: [['20 Aug', 'Used in 400+ projects this month.']],
  },
]
