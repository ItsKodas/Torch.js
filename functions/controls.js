module.exports = {

    Check: function(id) {
        const Permissions = require('../local/permissions.json')

        if (Permissions.overrides.administrators.includes(user.id)) return true

    }

}