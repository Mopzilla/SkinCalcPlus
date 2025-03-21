window.scplus2 = window.scplus2 || {};


scplus2.prefix = "scplus2";


scplus2.observer = new MutationObserver(() => {
    if (!scplus2.is_null_or_set_pending("div.roulette-wrapper div.roulette div.roulette-cases")) {
        scplus2.generate_case_page();
    }

    if ($("div.giveaway-case").length) {
        if (!scplus2.is_null_or_set_pending("div.container.sm.skins-list")) {
            scplus2.generate_giveaway_page();
        }
    }

    if (!scplus2.is_null_or_set_pending(".header-block-wrapper .sticky-profile .user-block")) {
        scplus2.generate_header();
    }
});


scplus2.is_null_or_set_pending = function(selector) {
    const pending_class = `${scplus2.prefix}-pending`;

    if(!$(selector).length) {
        // element doesn't exist
        return true;
    }

    if ($(selector).length > 1) {
        // too many elements matched, refine selector
        alert("more than one element matches the filter of: " + selector.toString());
        $(selector).addClass(pending_class);
        return true;
    }
    
    if ($(selector).hasClass(pending_class)) {
        // element already pending
        return true;
    }

    // element exists and isn't already pending
    $(selector).addClass(pending_class);
    return false;
}


scplus2.observer.observe(document, {
    subtree: true,
    childList: true,
    attributes: false,
    characterData: false,
});