export const preloadHandlebarsTemplates = async function () {
    const templatePaths = [
        'systems/chroniclesystem/templates/items/partials/header.hbs',
        'systems/chroniclesystem/templates/items/partials/header-delete.hbs',
        'systems/chroniclesystem/templates/items/partials/description.hbs',
        'systems/chroniclesystem/templates/items/partials/physical-item.hbs',
        'systems/chroniclesystem/templates/items/partials/equipment-item.hbs',

        'systems/chroniclesystem/templates/items/tabs/technique-details-tab.hbs',
        'systems/chroniclesystem/templates/items/tabs/technique-works-tab.hbs',

        'systems/chroniclesystem/templates/actors/partials/tabs/abilities-tab.hbs',
        'systems/chroniclesystem/templates/actors/partials/tabs/orders-tab.hbs',
        'systems/chroniclesystem/templates/actors/partials/tabs/combat-tab.hbs',
        'systems/chroniclesystem/templates/actors/partials/tabs/intrigue-tab.hbs',
        'systems/chroniclesystem/templates/actors/partials/tabs/qualities-tab.hbs',
        'systems/chroniclesystem/templates/actors/partials/tabs/sorcery-tab.hbs',
        'systems/chroniclesystem/templates/actors/partials/tabs/equipments-tab.hbs',
        'systems/chroniclesystem/templates/actors/partials/tabs/relationships-tab.hbs',
        'systems/chroniclesystem/templates/actors/partials/tabs/effects-tab.hbs',
        'systems/chroniclesystem/templates/actors/partials/tabs/description-tab.hbs',
        'systems/chroniclesystem/templates/actors/partials/form-group.hbs',

        'systems/chroniclesystem/templates/actors/partials/tabs/associates-tab.hbs',
        'systems/chroniclesystem/templates/actors/partials/tabs/military-tab.hbs',
        'systems/chroniclesystem/templates/actors/partials/tabs/org-dashboard-tab.hbs',
        'systems/chroniclesystem/templates/actors/partials/tabs/structure-tab.hbs',
        'systems/chroniclesystem/templates/actors/partials/tabs/territory-tab.hbs',

        'systems/chroniclesystem/templates/actors/partials/tabs/resources-tab.hbs',
        'systems/chroniclesystem/templates/actors/partials/tabs/events-tab.hbs',
        'systems/chroniclesystem/templates/actors/partials/tabs/members-tab.hbs',
        'systems/chroniclesystem/templates/actors/partials/tabs/holdings-tab.hbs',

        'systems/chroniclesystem/templates/components/rating-checkbox.hbs',
        'systems/chroniclesystem/templates/components/house-resource-item.hbs',
        'systems/chroniclesystem/templates/components/member-list-item.hbs',
        'systems/chroniclesystem/templates/components/resource-holdings.hbs',

        'systems/chroniclesystem/templates/actors/partials/tabs/warfare-tab.hbs',
        'systems/chroniclesystem/templates/actors/partials/tabs/formation-tab.hbs'
    ];
    return loadTemplates(templatePaths);
};
