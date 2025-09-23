window.scplus2 = window.scplus2 || {};

scplus2.selectors = {
    // Profile Page
    user_xp: `.user-level-profile > div`, // the div containing the raw text showing the xp

    // Header
    sticky_user: `._d2d1faad5aaa .user-block`, // the bottom most container of the sticky header user elements








    // Battle Page (useless)
    battle_slots: `._c22a12eacc84`, // the div containing all individual battle slot elements
    battle_slot: `._c045a6687ca4`, // the individual battle slot elements contained by the above element
    crazy_mode: `.crazy-mode`, // any identifier of the gamemode being crazy mode, such as the roulette icon
    is_teams: `.is-team-battle`, // any identifier of the gamemode being teamed, such as a class on .battle_slots
    is_sharing: `.is-sharing`, // any identifier of the gamemode being sharing, such as the roulette icon
    battle_roulette: `.battle-progress__roulette`, // the topmost parent of the roulette slider
    battle_teams: `._c24cbb6e17d7`, // the bar containing both sides above the slots
    battle_team: `._e8b714dca07f`, // the shared class between both sides of the bar
    team_ct: `._a472a89cbeec ._358e46a849c3`, // the value for the ct side of the bar
    team_t: `._ba78eede67d2 ._358e46a849c3`, // the value for the t side of the bar
    battle_finished: `.is-battle-finished`, // the class that gets added to .battle_slots when the battle has ended
}
