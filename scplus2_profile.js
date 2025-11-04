window.scplus2 = window.scplus2 || {};


scplus2.generate_profile = async function() {
    if (!$(scplus2.selectors.user_xp).length) {
        alert(".user-level__xp-info not found despite being found earlier");
        return
    }

    const cur_xp = parseFloat($(scplus2.selectors.user_xp).text().replace("XP ", "").split(" / ")[0]);

    let daily_json;
    try {
        daily_json = await $.getJSON(`https://gate.skin.club/apiv2/v2/daily-cases?page=1&per-page=50`);
        daily_json = daily_json.data;
        daily_json.sort((a, b) => a.level.xp - b.level.xp);
    } catch (err) {
        alert(`failed to get api data for daily cases`);
        return;
    }

    let req_xp, req_level;
    for (const data of daily_json) {
        if (data.level.xp / 100 <= cur_xp) {
            continue;
        }

        req_xp = data.level.xp / 100 - cur_xp;
        req_level = data.level.level_number;
        break;
    }

    const profile_prefix = scplus2.prefix + "-p182";
    $(scplus2.selectors.user_xp).append(`
        <span 
            id="${profile_prefix}-req-xp"
            title=
"Required XP is calculated by subtracting your current XP from the amount of XP required to reach the next daily case milestone.

The approximate USD is calculated loosely by assuming that 1 XP is worth 0.005 USD.

This is because all cases have an expected value of approximately 90%. Thus 1 USD gains 20 XP and you are expected to be left with 0.9 USD, which is worth 18 XP.

Because you typically only spend 10% of the USD you put in, you can loosely assume the USD required to reach 1 XP is 10x less than the true value.

Again, this is an approximation and slightly overvalues your USD and it is also reliant on hitting the 90% expected value.

To get the best chances at reaching a level milestone you either want cases with high EV and less rare top skins or cases with very high median returns.

There are community cases with really high break even odds and high median returns, these cases would be the best option for pure XP farming"
        >XP ${req_xp} to lvl${req_level} (&asymp;$${Math.ceil(req_xp * 0.005)})</span>
    `);
}
