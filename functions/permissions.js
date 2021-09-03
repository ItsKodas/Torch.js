module.exports = {

    Check: function(user, access) {
        const Permissions = require('../local/permissions.json')

        if (Permissions.overrides.administrators.includes(user.id)) return true

    }

}