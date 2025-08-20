import { authHandler, commonHandler } from './static/messages.js';

const responseMessages = {
  // Informational responses (100–199)
  100: {
    code: 100,
    info: 'Continue',
  },

  101: {
    code: 101,
    info: 'Switching Protocol',
  },

  102: {
    code: 102,
    info: 'Processing',
  },

  103: {
    code: 103,
    info: 'Early Hints',
  },

  // Successful responses (200–299)
  200: {
    code: 200,
    info: 'OK',
  },

  201: {
    code: 201,
    info: 'Created',
  },

  202: {
    code: 202,
    info: 'Accepted',
  },

  203: {
    code: 203,
    info: 'Non-Authoritative Information',
  },

  204: {
    code: 204,
    info: 'No Content',
  },

  205: {
    code: 205,
    info: 'Reset Content',
  },

  206: {
    code: 206,
    info: 'Partial Content',
  },

  207: {
    code: 207,
    info: 'Multi-Status',
  },

  208: {
    code: 208,
    info: 'Already Reported',
  },

  226: {
    code: 226,
    info: 'IM Used',
  },

  // Redirects (300–399)
  300: {
    code: 300,
    info: 'Multiple Choice',
  },

  301: {
    code: 301,
    info: 'Moved Permanently',
  },

  302: {
    code: 302,
    info: 'Found',
  },

  303: {
    code: 303,
    info: 'See Other',
  },

  304: {
    code: 304,
    info: 'Not Modified',
  },

  305: {
    code: 305,
    info: 'Use Proxy',
  },

  307: {
    code: 307,
    info: 'Temporary Redirect',
  },

  308: {
    code: 308,
    info: 'Permanent Redirect',
  },

  // Client errors (400–499)
  400: {
    code: 400,
    info: 'Bad Request',
  },

  401: {
    code: 401,
    info: 'Unauthorized',
  },

  402: {
    code: 402,
    info: 'Payment Required',
  },

  403: {
    code: 403,
    info: 'Forbidden',
  },

  404: {
    code: 404,
    info: 'Not Found',
  },

  405: {
    code: 405,
    info: 'Method Not Allowed',
  },

  406: {
    code: 406,
    info: 'Not Acceptable',
  },

  407: {
    code: 407,
    info: 'Proxy Authentication Required',
  },

  408: {
    code: 408,
    info: 'Request Timeout',
  },

  409: {
    code: 409,
    info: 'Conflict',
  },

  410: {
    code: 410,
    info: 'Gone',
  },

  411: {
    code: 411,
    info: 'Length Required',
  },

  412: {
    code: 412,
    info: 'Precondition Failed',
  },

  413: {
    code: 413,
    info: 'Payload Too Large',
  },

  414: {
    code: 414,
    info: 'URI Too Long',
  },

  415: {
    code: 415,
    info: 'Unsupported Media Type',
  },

  416: {
    code: 416,
    info: 'Range Not Satisfiable',
  },

  417: {
    code: 417,
    info: 'Expectation Failed',
  },

  418: {
    code: 418,
    info: "I'm a teapot",
  },

  421: {
    code: 421,
    info: 'Misdirected Request',
  },

  422: {
    code: 422,
    info: 'Unprocessable Entity',
  },

  423: {
    code: 423,
    info: 'Locked',
  },

  424: {
    code: 424,
    info: 'Failed Dependency',
  },

  425: {
    code: 425,
    info: 'Too Early',
  },

  426: {
    code: 426,
    info: 'Upgrade Required',
  },

  428: {
    code: 428,
    info: 'Precondition Required',
  },

  429: {
    code: 429,
    info: 'Too Many Requests',
  },

  431: {
    code: 431,
    info: 'Request Header Fields Too Large',
  },

  444: {
    code: 444,
    info: 'Connection Closed Without Response',
  },

  451: {
    code: 451,
    info: 'Unavailable For Legal Reasons',
  },

  499: {
    code: 499,
    info: 'Client Closed Request',
  },

  // Server errors (500–599)
  500: {
    code: 500,
    info: 'Internal Server Error',
  },

  501: {
    code: 501,
    info: 'Not Implemented',
  },

  502: {
    code: 502,
    info: 'Bad Gateway',
  },

  503: {
    code: 503,
    info: 'Service Unavailable',
  },

  504: {
    code: 504,
    info: 'Gateway Timeout',
  },

  505: {
    code: 505,
    info: 'HTTP Version Not Supported',
  },

  506: {
    code: 506,
    info: 'Variant Also Negotiates',
  },

  507: {
    code: 507,
    info: 'Insufficient Storage',
  },

  508: {
    code: 508,
    info: 'Loop Detected',
  },

  510: {
    code: 510,
    info: 'Not Extended',
  },

  511: {
    code: 511,
    info: 'Network Authentication Required',
  },

  599: {
    code: 599,
    info: 'Network Connect Timeout Error',
  },
};

class Response {
  constructor(code, status, data = '') {
    this.code = code || 500;
    this.status = status || 'T';
    this.data = data;
  }

  custom(message) {
    const responseType = responseMessages[this.code];
    const output = {};

    output.code = responseType.code;

    if (this.status === 'T' && this.code === 500) {
      output.status = false;
    } else if (this.status === 'T') {
      output.status = true;
    } else {
      output.status = false;
    }

    output.info = responseType.info;

    if (this.data) {
      output.data = this.data;
    }

    if (message) {
      output.message = message;
    }

    return output;
  }

  auth(type, related) {
    const responseType = responseMessages[this.code];
    const output = {};

    output.code = responseType.code;

    if (this.status === 'T' && this.code === 500) {
      output.status = false;
    } else if (this.status === 'T') {
      output.status = true;
    } else {
      output.status = false;
    }

    output.info = responseType.info;

    output.message = authHandler(type, related);

    if (this.data) {
      output.data = this.data;
    }

    return output;
  }

  common(typeProp, relatedTo, idx) {
    const responseType = responseMessages[this.code];
    const output = {};

    output.code = responseType.code;

    if (this.status === 'T' && this.code === 500) {
      output.status = false;
    } else if (this.status === 'T') {
      output.status = true;
    } else {
      output.status = false;
    }

    output.info = responseType.info;

    output.message = commonHandler(typeProp, relatedTo, idx);

    if (this.data) {
      output.data = this.data;
    }

    return output;
  }
}

export default Response;
