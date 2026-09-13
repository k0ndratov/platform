// Demo data shared by the server seed (SQLite) and the browser adapter (localStorage).
// Keep this file free of Node or browser specific code.

// [login, program, cohort, level, levelProgress, campus, skills, bio?]
export const demoUsers = [
  ['mageneus', 'Core program', '26_04_TAS', 7, 78, '21 Tashkent', ['Vue', 'JavaScript', 'Rails', 'PostgreSQL', 'Figma'], 'Frontend dev, Vue fan, learning Rails on the side. Building PeerDesk with zephyrus. Always up for a coffee and a pet project chat.'],
  ['zephyrus', 'Core program', '26_04_TAS', 8, 12, '21 Tashkent', ['Rails', 'PostgreSQL'], 'Backend person. Rails, SQL, and too many WebSocket edge cases. Co-founder of PeerDesk.'],
  ['ferrisfan', 'Core program', '25_11_TAS', 9, 40, '21 Tashkent', ['Rust', 'Python'], 'Rust at night, Python by day. Building ReviewMate and looking for a co-founder who loves talking to users.'],
  ['pixelkat', 'Core program', '26_04_TAS', 5, 60, '21 Tashkent', ['Figma', 'User research'], 'UX research and Figma. I interview students so you do not have to guess.'],
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
// comments: [authorLogin, text, hoursAfterPost]
// roadmap: [title, date, status, text]
// updates: [date, text]
/** ISO date `hours` after another ISO date. Used to place demo comments after their post. */
export const hoursAfter = (iso, hours) => new Date(new Date(iso).getTime() + hours * 3600000).toISOString()

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
      ['mageneus', 'Why we killed the "reserve a desk" feature', 'In the first prototype you could reserve a desk for 30 minutes. It felt smart, but in tests people reserved desks and never came. We removed it. Now the map only shows real presence from badge check-ins, and the data became honest again.', [['dijkstra_21', 'Same lesson in Deadline Radar: fake "commitment" features make the data lie.', 3], ['catan_master', 'Did anyone complain when you removed it?', 5], ['mageneus', '@catan_master two people. Both use the map daily now anyway.', 6], ['ci_wizard', 'Honest data beats smart features. Good call.', 26]], '2026-09-11T10:00:00Z', 24],
      ['zephyrus', 'From polling to WebSocket in one evening', 'The map used to refresh every 10 seconds with a plain HTTP request. It worked, but 200 clients made the Rails server sad. I moved updates to Action Cable. Short write-up about what broke and how we fixed it.', [['nodeknight', 'How do you handle reconnects? We had ghost clients with Socket.IO.', 4], ['zephyrus', 'Action Cable reconnects by itself, and we re-send the full cluster state on connect. Cheap, about 2 KB.', 6], ['gopher_x', 'Curious how this compares to a plain Go WebSocket server. Might try it.', 30]], '2026-09-03T18:30:00Z', 41],
      ['mageneus', 'Beta week one: what broke and what did not', 'Twenty students used the live map for a week. The map itself was stable. What broke: check-ins on the 2nd floor turnstile were lost when the Wi-Fi dropped. Now the badge reader queues events on the device and sends them when the network is back. We lost zero check-ins since Monday.', [['ops_guy', 'The 2nd floor Wi-Fi is a known problem. Ping me if you need the router logs.', 2], ['zephyrus', 'Queue on the device was the right fix. Zero lost events since.', 20]], '2026-09-08T09:30:00Z', 19],
      ['pixelkat', '20 interviews, 3 surprises', 'I talked with students from three cohorts. Surprise one: nobody cares about the exact desk, they care about sitting near friends. Surprise two: the kitchen is the real "cluster zero". Surprise three: people trust the badge more than the app.', [['sally_ui', '"The kitchen is cluster zero" is so true.', 5], ['pixelkat', 'And the badge trust thing changed our whole design. Less app, more badge.', 8]], '2026-08-25T12:00:00Z', 18],
      ['pixelkat', 'Designing the empty map', 'What do you show when a cluster has zero check-ins? The first version showed an empty grey grid and people thought the app was broken. Now the empty state says "Cluster 3 is quiet right now" and suggests the nearest busy cluster. Small text, big difference in the tests.', [['docwriter', 'Good empty-state copy is underrated. Nice.', 12]], '2026-08-18T15:00:00Z', 11],
      ['zephyrus', 'How a badge check-in becomes a dot on the map', 'The turnstile sends one event: badge id, reader id, time. The API maps the reader to a cluster, writes a presence row, and broadcasts a tiny JSON message. The frontend only moves one dot. No page reload, no full map refresh. The whole path takes about 300 ms.', [['tmuxlover', '300 ms end to end is great. Is the turnstile latency included?', 7], ['zephyrus', 'Yes, measured from the badge tap.', 9]], '2026-08-10T19:00:00Z', 22],
    ],
    roadmap: [
      ['Idea and first interviews', 'Mar 2026', 'done', 'Problem confirmed with 20 students.'],
      ['Badge check-in prototype', 'Aug 2026', 'done', 'Check-in works on the campus turnstile.'],
      ['Live map for Cluster 1 and 2', 'Sep 2026', 'in-progress', 'Beta with 20 students, fixing WebSocket edge cases.'],
      ['All clusters + kitchen', 'Oct 2026', 'planned', 'Cover the whole campus.'],
      ['"Near my friends" button', 'Nov 2026', 'planned', 'Find a desk next to people you follow.'],
      ['Privacy settings', 'Dec 2026', 'planned', 'Choose who can see where you sit, or go invisible.'],
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
    posts: [
      ['ferrisfan', 'First checklist, built by hand', 'Before writing any AI code I made a checklist for the s21_string project by hand. It has 23 items. I gave it to five students before their review. Four of them passed. The fifth failed on an item that was not on the list, so now the list has 24 items. The lesson: start with the boring manual version.', [['pixelkat', 'Can I get the checklist for s21_string? My review is on Friday.', 4], ['ferrisfan', 'Sure, sent you the link.', 5], ['segfault_hunter', 'Item 24 should be "run it under valgrind". Ask me how I know.', 20]], '2026-09-08T10:00:00Z', 14],
      ['ferrisfan', 'Why version one will not read your code', 'Reading student code with an AI raises three questions: privacy, cheating, and cost. So version one reads only the task text and the public style rules. Code reading comes later, opt-in, and only for your own project. Simple rules first, smart features later.', [['dijkstra_21', 'Opt-in is the right default. Students worry about cheating flags.', 3], ['ci_wizard', 'Cost is real too. Rules text is tiny, code is not.', 10]], '2026-09-04T16:00:00Z', 21],
      ['ferrisfan', 'What students told me about peer review', 'Ten interviews in one week. The most common answer to "why did you fail?" was "a small thing I forgot to check". That is exactly the gap ReviewMate wants to close.', [['mageneus', 'Would use this before every review.', 6], ['rusty_nail', 'Same. Small things fail me every time.', 15]], '2026-08-30T09:00:00Z', 9],
    ],
    roadmap: [
      ['Interviews', 'Aug 2026', 'done', '10 interviews done.'],
      ['Manual checklist for one project', 'Sep 2026', 'done', '24 items for s21_string, tested with 5 students.'],
      ['Checklist generator', 'Oct 2026', 'in-progress', 'First version for C projects.'],
      ['Test with 50 students', 'Nov 2026', 'planned', 'Compare pass rates with and without the checklist.'],
      ['Practice Q&A', 'Dec 2026', 'planned', 'Short review simulation.'],
      ['Code reading (opt-in)', 'Q1 2027', 'planned', 'Checklist items generated from your own code.'],
    ],
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
      ['catan_master', '1,200 orders in a month: what we learned', 'Peak time is 14:00–15:00. Clusters on the 3rd floor order twice as often as the 1st floor. And yes, 40% of all orders are the same chicken wrap.', [['ops_guy', 'The chicken wrap number is not a joke. We call it "the default".', 2], ['sally_ui', 'The 3rd floor has no kitchen nearby, so it makes sense.', 4], ['pixelkat', 'Would love to see this by cohort too.', 9], ['catan_master', '@pixelkat next month, once we have enough data.', 10]], '2026-09-06T14:00:00Z', 33],
      ['ops_guy', 'One delivery per cluster: how the pickup works', 'The courier leaves everything at the entrance desk. One person from the cluster gets a push and picks up the whole bag. It sounds fragile, but in three months we lost exactly two lunches. Both times the "pickup person" was in a review. Now the app asks a second person as backup.', [['mageneus', 'A backup pickup person is a smart small fix.', 5]], '2026-08-28T13:00:00Z', 16],
      ['sally_ui', 'Redesigning the order screen for the lunch rush', 'At 14:00 people order in under a minute, mostly from the phone while walking. We cut the order flow from 5 screens to 2 and put a "same as last time" button on top. Half of all orders now use that button.', [['pixelkat', 'Two screens instead of five. That is the whole design lesson in one line.', 3], ['tmuxlover', 'The "same as last time" button was a 20-line change and our best feature.', 6]], '2026-08-12T10:00:00Z', 29],
      ['tmuxlover', 'Building the bill split without a payment provider', 'We started with manual transfers and a shared table. Ugly, but it let us launch two months earlier.', [['nodeknight', 'The shared table still exists somewhere, I am sure of it.', 2], ['tmuxlover', 'It does. Nobody touches it.', 3]], '2026-07-20T11:00:00Z', 27],
      ['nodeknight', 'Handling 300 orders in one hour', 'Our Node API did fine. The cafe printer did not. It printed 300 separate tickets and the kitchen stopped reading them. Now orders are grouped per cluster and printed as one ticket with a summary on top.', [['ops_guy', 'The cafe owner still talks about that day.', 8]], '2026-06-25T16:00:00Z', 12],
    ],
    roadmap: [
      ['Launch in 21 Tashkent', 'Jun 2026', 'done', 'First cafe partner.'],
      ['"Same as last time" button', 'Aug 2026', 'done', 'Reorder in one tap. Used in half of all orders.'],
      ['Three cafe partners', 'Sep 2026', 'done', 'More choice for lunch.'],
      ['In-app payments', 'Nov 2026', 'in-progress', 'Talking to two providers.'],
      ['Evening deliveries', 'Dec 2026', 'planned', 'Cover the late shift until 22:00.'],
      ['Other campuses', '2027', 'planned', 'Start with 21 Kazan.'],
    ],
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
    posts: [
      ['dijkstra_21', 'Web beta: the first 60 users', 'We opened the beta to two cohorts. 60 students imported their deadlines in the first week. The most used feature is not reminders, it is the "this week" view. People open it every morning like a to-do list.', [['cron_cat', 'The "this week" view was a two-hour side task. Users decide what matters.', 3], ['mageneus', 'Imported mine today. The weekly view is exactly what I needed.', 10]], '2026-09-05T11:00:00Z', 22],
      ['cron_cat', 'Reminders that adapt to your progress', 'A reminder three days before a deadline is useless if you have not started. We now look at how much of the project is done and move the reminder earlier when the project is big and untouched. A small cron job, a big change in how the app feels.', [['zephyrus', 'How do you know the progress? Manual input?', 2], ['cron_cat', 'For now yes, a slider per project. Git activity later, maybe.', 4], ['docwriter', 'Please keep the slider, it is fast.', 12]], '2026-08-22T17:00:00Z', 18],
      ['dijkstra_21', 'Importing deadlines without an official API', 'There is no public API for project deadlines, so the first version asks you to paste your project list. It takes 30 seconds and works for every campus. Not elegant, but it let us ship in May instead of waiting for an API that may never come.', [['gopher_x', 'Paste-and-parse is a fine v1. Ship first, wait for the API never.', 5]], '2026-07-30T09:00:00Z', 15],
    ],
    roadmap: [
      ['Deadline import', 'Jun 2026', 'done', 'Paste your project list, get a calendar.'],
      ['Web beta', 'Sep 2026', 'done', '60 active users.'],
      ['Smart reminders', 'Oct 2026', 'in-progress', 'Reminders move earlier for big untouched projects.'],
      ['Mobile app', 'Dec 2026', 'planned', 'Push reminders.'],
      ['Calendar sync', 'Q1 2027', 'planned', 'Export to Google Calendar and iCal.'],
    ],
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
    links: [],
    posts: [
      ['gopher_x', 'First prototype: a leaderboard on my laptop', 'A Go server, one WebSocket, and a page with six bars. I showed it in the kitchen and three people asked when it goes on the campus TV. Nobody asked what it does. That is the best feedback a prototype can get.', [['sally_ui', 'I can help with the TV screen design if you want.', 1], ['gopher_x', '@sally_ui yes please. Applying to the designer role is enough.', 2]], '2026-09-12T15:00:00Z', 8],
      ['gopher_x', 'Why I started TribeBoard', 'Last tournament my tribe lost 40 points in one day and nobody could say why. We found the reason two days later: a missed cleaning duty. If the points were visible in real time, we would have fixed it the same hour. That is the whole idea.', [['catan_master', 'We lost 30 points the same week. Same story.', 4], ['ci_wizard', 'If the feed has a "reason" column, the whole tribe learns from it.', 7]], '2026-09-10T12:00:00Z', 13],
    ],
    roadmap: [
      ['Idea and first talks', 'Sep 2026', 'done', 'Talked with three tribe leaders.'],
      ['Prototype leaderboard', 'Oct 2026', 'in-progress', 'Go server and one screen with live bars.'],
      ['Events feed', 'Nov 2026', 'planned', 'Who earned points and for what.'],
      ['Campus TV screens', 'Dec 2026', 'planned', 'Leaderboard in the lounge and the kitchen.'],
    ],
    updates: [],
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
    posts: [
      ['rusty_nail', 'Rewriting the parser in Rust', 'The first parser was 2,000 lines of C and crashed on macros. The Rust version is shorter, handles macros, and runs the whole style guide in 40 ms on a typical project. The hardest part was not Rust. It was writing tests for every strange macro we found in real student code.', [['segfault_hunter', '2,000 lines of C, and it was my code. No regrets.', 1], ['gopher_x', '40 ms is fast. Is that with the full rule set?', 5], ['rusty_nail', '@gopher_x yes, all 60 rules, on a 3k-line project.', 6], ['ferrisfan', 'Rust for parsers is such a good fit.', 22]], '2026-09-02T14:00:00Z', 37],
      ['segfault_hunter', 'Every warning should teach something', 'A linter that only says "line too long" is useless for learning. Each C-Lint rule links to a one-paragraph explanation and a before/after example.', [['docwriter', 'This is why the docs took a month.', 3], ['mageneus', 'Would love this for JS too.', 10], ['segfault_hunter', '@mageneus one language at a time :)', 12], ['dijkstra_21', 'The before/after examples are what make it click.', 30]], '2026-08-21T16:00:00Z', 52],
      ['docwriter', 'Writing 60 rule explanations', 'Every rule gets one paragraph and one before/after example. Rule 14, function length, took the longest, because the honest answer is "it depends". We ended with three examples for that one. The docs site is live now, and every warning in the CLI links to it.', [['rusty_nail', 'The rule 14 examples helped me too, honestly.', 4], ['ci_wizard', 'Linking every CI warning to the docs page was the best UX decision.', 9]], '2026-08-05T12:00:00Z', 25],
      ['ci_wizard', 'One line in .gitlab-ci.yml', 'The CI job took a week to make simple. Now it is one include line. It runs on every push and comments on the merge request with the exact rule and the fix. No config, no tokens, no setup meeting.', [['ops_guy', 'One include line. That is how CI should feel.', 2], ['nodeknight', 'Added it to our project in a minute. Works.', 26]], '2026-07-15T10:00:00Z', 30],
    ],
    roadmap: [
      ['CLI tool', 'Mar 2026', 'done', 'Covers the School 21 style guide.'],
      ['Rust parser', 'May 2026', 'done', 'Handles macros, 40 ms per project.'],
      ['GitLab CI job', 'Jul 2026', 'done', 'One line in .gitlab-ci.yml.'],
      ['Explanations for all 60 rules', 'Aug 2026', 'done', 'Docs site live, every warning links to it.'],
      ['Editor plugin', 'Nov 2026', 'in-progress', 'VS Code first.'],
      ['Auto-fix mode', 'Q1 2027', 'planned', 'Fix simple rules with one command.'],
    ],
    updates: [['20 Aug', 'Used in 400+ projects this month.']],
  },
]
