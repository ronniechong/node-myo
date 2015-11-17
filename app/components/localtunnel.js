var localtunnel = require('localtunnel'),
    clc         = require('cli-color'),
    opts        = {
                    subdomain: 'somesubdomainabc123'
                };

module.exports = function(settings, callback){
    opts        = {
        'subdomain': settings.config.subDomain
    };

    var tunnel  = localtunnel(settings.config.port, opts ,function(err, tunnel) {
        if (err){
            console.log(err);
        }
        console.log(clc.blue('LocalTunnel: Running',tunnel.url));
        settings.module.localtunnel = tunnel;
        callback(null, tunnel);
    });

    tunnel.on('close', function() {
        console.log(clc.green('LocalTunnel: localtunnel is closed'));
    });

    return tunnel;
};
