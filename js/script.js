const results = document.querySelector('#results');

const urlFields = [
    {
        key: 'href',
        label: 'href'
    },
    {
        key: 'origin',
        label: 'Origin'
    },
    {
        key: 'protocol',
        label: 'Protocol'
    },
    {
        key: 'username',
        label: 'Username'
    },
    {
        key: 'password',
        label: 'Password'
    },
    {
        key: 'host',
        label: 'Host'
    },
    {
        key: 'hostname',
        label: 'Hostname'
    },
    {
        key: 'port',
        label: 'Port'
    },
    {
        key: 'search',
        label: 'Search'
    },
    {
        key: 'hash',
        label: 'Hash'
    }
]

const ipResolutionFetchError = 'There was an error fetching the IP resolution results! Please try again later.';
const ipResolutionNoResultsError = 'No resolved IPs found!';

function isIpAddress(hostname) {
    return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(hostname);
}

async function resolveIpAddress(domain) {
    let response;
    try {
        response = await fetch(`https://cloudflare-dns.com/dns-query?name=${domain}&type=A`, {
            headers: {
                'accept': 'application/dns-json'
            }
        });
    } catch(error) {
        throw new Error(ipResolutionFetchError);
    }

    let answerArray = [];
    try {
        answerArray = (await response.json()).Answer;
    } catch (error) {
        throw new Error(ipResolutionNoResultsError);
    }

    let result = [];
    if(!answerArray || answerArray.length < 1){
        throw new Error(ipResolutionNoResultsError);
    }

    return answerArray
            .map(answer => answer.data && isIpAddress(answer.data) ? answer.data : '')
            .filter(answer => answer !== '')
            .join(', ');
}

function buildResultTable(url, resolvedIps, ipResolutionFailed) {
    let html = '';

    html += '<table>' +
                '<legend>' +
                    'Analysis Results' +
                '</legend>'

    if(resolvedIps) {
        html += '<tr>' +
                    '<th>IP Address</th>' +
                    `<td${ipResolutionFailed ? ' class="color-red"' : ''}>${resolvedIps}</td>` +
                '</tr>'

    }

    urlFields.forEach(field => {
        if(url[field.key]) {
            html += '<tr>' +
                        `<th>${field.label}</th>` +
                        `<td>${url[field.key]}</td>` +
                    '</tr>'
        }
    })

    html += '</table>'

    results.innerHTML = html;
}

async function analyzeURL(event)  {
    event.preventDefault();
    const url = event.target.url.value;
    const resolveIp = event.target.resolveip.checked;

    if (URL.canParse(url)) {
        const parsedURL = new URL(url);
        let resolvedIps = '';
        let ipResolutionFailed = false;
        if(resolveIp && !isIpAddress(parsedURL.hostname)) {
            try {
                resolvedIps = await resolveIpAddress(parsedURL.hostname);
            } catch (error) {
                console.log(error.message);
                resolvedIps = error.message;
                ipResolutionFailed = true
            }
        }
        buildResultTable(parsedURL, resolvedIps, ipResolutionFailed);
    }
    else {
        alert('Invalid URL!');
    }
}

const form = document.querySelector('#form');

form.addEventListener('submit', analyzeURL);
