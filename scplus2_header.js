window.scplus2 = window.scplus2 || {};


scplus2.generate_header = async function() {
    const top_block_selector = `.header-block-wrapper .top-block`;
    // .sticky-profile gets overwritten by css, so use child element instead
    const sticky_selector = `.header-block-wrapper .sticky-profile .user-block`;

    if (!$(top_block_selector)) {
        alert(".top-block not found despite being found earlier");
        return;
    }

    if (!$(sticky_selector)) {
        alert(".sticky-profile not found despite being found earlier");
        return;
    }

    let sections_json, giveaway_json, remaining_time, end_time, seconds_left;
    await get_time_remaining();

    const head_prefix = `${scplus2.prefix}-h917`
    $(sticky_selector).append(`<div id="${head_prefix}-sticky-container"></div>`);

    for (i in giveaway_json.cases) {
        const giveaway_case = giveaway_json.cases[i];
        $(`#${head_prefix}-sticky-container`).append(`
            <div id="${head_prefix}-${giveaway_case.name}" class="${head_prefix}-case">
                <a href="https://skin.club/en/cases/${giveaway_case.name}">
                    <p class="${head_prefix}-hours">00</p>
                    <span></span>
                    <svg width="204" height="204" viewBox="0 0 204 204"><path d="M90.0579 142.145C89.084 143.16 87.7559 143.727 86.3758 143.727C84.9957 143.727 83.6676 143.16 82.6937 142.145L53.2889 111.647C50.237 108.482 50.237 103.351 53.2889 100.192L56.971 96.3732C60.023 93.2083 64.9654 93.2083 68.0174 96.3732L86.3758 115.411L135.983 63.9684C139.035 60.8036 143.982 60.8036 147.029 63.9684L150.711 67.7868C153.763 70.9517 153.763 76.0824 150.711 79.2419L90.0579 142.145Z" fill="#4AF1B8"></path></svg>
                    <p class="${head_prefix}-minutes">00</p>
                    <span></span>
                    <p class="${head_prefix}-seconds">00</p>
                </a>
            </div>
        `);
    }

    countdown();


    async function countdown() {
        let hours_cache = null;
        let minutes_cache = null;
        let seconds_cache = null;

        while (seconds_left > 0) {
            seconds_left = Math.max(0, Math.round((end_time - Date.now()) / 1000));
            const hours = Math.floor(seconds_left / 3600);
            const minutes = Math.floor((seconds_left % 3600) / 60);
            const seconds = seconds_left % 60;

            if (hours != hours_cache) {
                $(`.${head_prefix}-hours`).text(hours.toString().padStart(2, "0"));
                hours_cache = hours;
            }

            if (minutes != minutes_cache) {
                $(`.${head_prefix}-minutes`).text(minutes.toString().padStart(2, "0"));
                minutes_cache = minutes;
            }

            if (seconds != seconds_cache) {
                $(`.${head_prefix}-seconds`).text(seconds.toString().padStart(2, "0"));
                seconds_cache = seconds;
            }

            await new Promise(resolve => setTimeout(resolve, 250));
        }

        await handle_timer_end();
        countdown();
    }

    
    async function handle_timer_end() {
        await get_time_remaining();

        if (seconds_left > 0) {
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 30000));
    }


    async function get_time_remaining() {
        try {
            const perf_now = performance.now();
            sections_json = await $.getJSON(`https://gate.skin.club/apiv2/main-sections?page=1&per-page=100`);
            const perf_after = performance.now();
            sections_json = sections_json.data;
            giveaway_json = sections_json.filter(section => section.type === "time")[0];
            remaining_time = giveaway_json.cases[0].active_giveaway.remaining_time;
            remaining_time -= (perf_after - perf_now) / 1000;
            remaining_time = Math.round(remaining_time);
            end_time = Date.now() + remaining_time * 1000;
            seconds_left = remaining_time;
        } catch (err) {
            alert(`failed to get main-sections from api`);
            return;
        }
    }
}