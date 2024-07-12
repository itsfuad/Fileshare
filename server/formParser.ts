type Part = {
    contentDispositionHeader: string
    contentTypeHeader: string
    part: number[]
}

type Input = {
    filename?: string
    name?: string
    type: string
    data: Buffer
}

enum ParsingState {
    INIT,
    READING_HEADERS,
    READING_DATA,
    READING_PART_SEPARATOR
}

export function parse(multipartBodyBuffer: Buffer, boundary: string): Input[] {
    let lastline = '';
    let contentDispositionHeader = '';
    let contentTypeHeader = '';
    let state: ParsingState = ParsingState.INIT;
    let buffer: number[] = [];
    const allParts: Input[] = [];

    let currentPartHeaders: string[] = [];

    for (let i = 0; i < multipartBodyBuffer.length; i++) {
        const oneByte: number = multipartBodyBuffer[i];
        const prevByte: number | null = i > 0 ? multipartBodyBuffer[i - 1] : null;
        // 0x0a => \n
        // 0x0d => \r
        const newLineDetected: boolean = oneByte === 0x0a && prevByte === 0x0d;
        const newLineChar: boolean = oneByte === 0x0a || oneByte === 0x0d;

        readPartSeparator({
            newLineChar,
            lastline,
            oneByte,
            state,
            buffer,
            boundary,
            currentPartHeaders,
            contentDispositionHeader,
            contentTypeHeader,
            newLineDetected,
            allParts
        });
    }
    return allParts;
}

function readPartSeparator(data: {
    newLineChar: boolean,
    lastline: string,
    oneByte: number,
    state: ParsingState,
    buffer: number[],
    boundary: string,
    currentPartHeaders: string[],
    contentDispositionHeader: string,
    contentTypeHeader: string,
    newLineDetected: boolean,
    allParts: Input[]
}) {
    if (!data.newLineChar) data.lastline += String.fromCharCode(data.oneByte);
    if (ParsingState.INIT === data.state && data.newLineDetected) {
        // searching for boundary
        if ('--' + data.boundary === data.lastline) {
            data.state = ParsingState.READING_HEADERS; // found boundary. start reading headers
        }
        data.lastline = '';
    } else if (ParsingState.READING_HEADERS === data.state && data.newLineDetected) {
        const readData = readHeader(data.lastline, data.currentPartHeaders, data.contentDispositionHeader, data.contentTypeHeader, data.state, data.buffer);
        data.lastline = readData.lastline
        data.currentPartHeaders = readData.currentPartHeaders
        data.contentDispositionHeader = readData.contentDispositionHeader
        data.contentTypeHeader = readData.contentTypeHeader
        data.state = readData.state
        data.buffer = readData.buffer
    } else if (ParsingState.READING_DATA === data.state) {
        const read = readData(data);
        data.lastline = read.lastline;
        data.buffer = read.buffer;
        data.state = read.state;
        data.currentPartHeaders = read.currentPartHeaders;
        data.contentDispositionHeader = read.contentDispositionHeader;
        data.contentTypeHeader = read.contentTypeHeader;
        data.allParts.push(...read.allParts);
    } else if (ParsingState.READING_PART_SEPARATOR === data.state) {
        if (data.newLineDetected) {
            data.state = ParsingState.READING_HEADERS;
        }
    }
}

function readData(data: {
    lastline: string,
    boundary: string,
    oneByte: number,
    newLineDetected: boolean,
    buffer: number[],
    state: ParsingState,
    currentPartHeaders: string[],
    contentDispositionHeader: string,
    contentTypeHeader: string,
    allParts: Input[]
}) {
    const { lastline, boundary, oneByte, newLineDetected, buffer, contentDispositionHeader, contentTypeHeader, allParts } = data;

    // parsing data
    if (lastline.length > boundary.length + 4) {
        data.lastline = ''; // mem save
    }
    if ('--' + boundary === lastline) {
        const j = buffer.length - lastline.length;
        const part = buffer.slice(0, j - 1);

        allParts.push(
            processPart({ contentDispositionHeader, contentTypeHeader, part })
        );
        data.buffer = [];
        data.currentPartHeaders = [];
        data.lastline = '';
        data.state = ParsingState.READING_PART_SEPARATOR;
        data.contentDispositionHeader = '';
        data.contentTypeHeader = '';
    } else {
        buffer.push(oneByte);
    }
    if (newLineDetected) {
        data.lastline = '';
    }

    return data;
}

function readHeader(lastline: string, currentPartHeaders: string[], contentDispositionHeader: string, contentTypeHeader: string, state: ParsingState, buffer: number[]) {
    // parsing headers. Headers are separated by an empty line from the content. Stop reading headers when the line is empty
    if (lastline.length) {
        currentPartHeaders.push(lastline);
    } else {
        // found empty line. search for the headers we want and set the values
        for (const h of currentPartHeaders) {
            if (h.toLowerCase().startsWith('content-disposition:')) {
                contentDispositionHeader = h;
            } else if (h.toLowerCase().startsWith('content-type:')) {
                contentTypeHeader = h;
            }
        }
        state = ParsingState.READING_DATA;
        buffer = [];
    }
    lastline = '';
    return { lastline, currentPartHeaders, contentDispositionHeader, contentTypeHeader, state, buffer };
}

//  read the boundary from the content-type header sent by the http client
//  this value may be similar to:
//  'multipart/form-data; boundary=----WebKitFormBoundaryvm5A9tzU1ONaGP5B',
export function getBoundary(header: string): string {
    const items = header.split(';');
    if (items.length > 1) {
        for (let item of items) {
            if (item.trim().indexOf('boundary') >= 0) {
                const k = item.split('=')[1].trim();
                return k.replace(/(^["'])|(["']$)/g, '');
            }
        }
    }
    return '';
}

export function DemoData(): { body: Buffer; boundary: string } {
    let body = 'trash1\r\n';
    body += '------WebKitFormBoundaryvef1fLxmoUdYZWXp\r\n';
    body += 'Content-Type: text/plain\r\n';
    body +=
        'Content-Disposition: form-data; name="uploads[]"; filename="A.txt"\r\n';
    body += '\r\n';
    body += '@11X';
    body += '111Y\r\n';
    body += '111Z\rCCCC\nCCCC\r\nCCCCC@\r\n\r\n';
    body += '------WebKitFormBoundaryvef1fLxmoUdYZWXp\r\n';
    body += 'Content-Type: text/plain\r\n';
    body +=
        'Content-Disposition: form-data; name="uploads[]"; filename="B.txt"\r\n';
    body += '\r\n';
    body += '@22X';
    body += '222Y\r\n';
    body += '222Z\r222W\n2220\r\n666@\r\n';
    body += '------WebKitFormBoundaryvef1fLxmoUdYZWXp\r\n';
    body += 'Content-Disposition: form-data; name="input1"\r\n';
    body += '\r\n';
    body += 'value1\r\n';
    body += '------WebKitFormBoundaryvef1fLxmoUdYZWXp--\r\n';
    return {
        body: Buffer.from(body),
        boundary: '----WebKitFormBoundaryvef1fLxmoUdYZWXp'
    }
}

function processPart(part: Part): Input {
    // will transform this object:
    // { header: 'Content-Disposition: form-data; name="uploads[]"; filename="A.txt"',
    // info: 'Content-Type: text/plain',
    // part: 'AAAABBBB' }
    // into this one:
    // { filename: 'A.txt', type: 'text/plain', data: <Buffer 41 41 41 41 42 42 42 42> }
    const obj = function (str: string) {
        const k = str.split('=');
        const a = k[0].trim();

        const b = JSON.parse(k[1].trim());
        const o = {};
        Object.defineProperty(o, a, {
            value: b,
            writable: true,
            enumerable: true,
            configurable: true
        });
        return o;
    }
    const header = part.contentDispositionHeader.split(';');

    const filenameData = header[2];
    let input = {};
    if (filenameData) {
        input = obj(filenameData);
        const contentType = part.contentTypeHeader.split(':')[1].trim();
        Object.defineProperty(input, 'type', {
            value: contentType,
            writable: true,
            enumerable: true,
            configurable: true
        });
    }
    // always process the name field
    Object.defineProperty(input, 'name', {
        value: header[1].split('=')[1].replace(/"/g, ''),
        writable: true,
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(input, 'data', {
        value: Buffer.from(part.part),
        writable: true,
        enumerable: true,
        configurable: true
    });
    return input as Input;
}