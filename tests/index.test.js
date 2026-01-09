const expectExport = require('expect');
const { SegmentedMessage } = require('../dist');
const SmartEncodingMap = require('../dist/libs/SmartEncodingMap').default;

const GSM7EscapeChars = ['|', '^', '€', '{', '}', '[', ']', '~', '\\'];

const TestData = [
  {
    testDescription: 'GSM-7 in one segment',
    body: '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890',
    encoding: 'GSM-7',
    segments: 1,
    messageSize: 1120,
    totalSize: 1120,
    characters: 160,
    unicodeScalars: 160,
  },
  {
    testDescription: 'GSM-7 in two segments',
    body: '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901',
    encoding: 'GSM-7',
    segments: 2,
    messageSize: 1127,
    totalSize: 1223,
    characters: 161,
    unicodeScalars: 161,
  },
  {
    testDescription: 'GSM-7 in three segments',
    body: '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567',
    encoding: 'GSM-7',
    segments: 3,
    messageSize: 2149,
    totalSize: 2293,
    characters: 307,
    unicodeScalars: 307,
  },
  {
    testDescription: 'UCS-2 message in one segment',
    body: '😜23456789012345678901234567890123456789012345678901234567890123456789',
    encoding: 'UCS-2',
    segments: 1,
    messageSize: 1120,
    totalSize: 1120,
    characters: 69,
    unicodeScalars: 69,
  },
  {
    testDescription: 'UCS-2 message in two segments',
    body: '😜234567890123456789012345678901234567890123456789012345678901234567890',
    encoding: 'UCS-2',
    segments: 2,
    messageSize: 1136,
    totalSize: 1232,
    characters: 70,
    unicodeScalars: 70,
  },
  {
    testDescription: 'UCS-2 message in three segments',
    body: '😜2345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234',
    encoding: 'UCS-2',
    segments: 3,
    messageSize: 2160,
    totalSize: 2304,
    characters: 134,
    unicodeScalars: 134,
  },
  {
    testDescription: 'UCS-2 with two bytes extended characters in one segments boundary',
    body: '🇮🇹234567890123456789012345678901234567890123456789012345678901234567',
    encoding: 'UCS-2',
    segments: 1,
    messageSize: 1120,
    totalSize: 1120,
    characters: 67,
    unicodeScalars: 68,
  },
  {
    testDescription: 'UCS-2 with extended characters in two segments boundary',
    body: '🇮🇹2345678901234567890123456789012345678901234567890123456789012345678',
    encoding: 'UCS-2',
    segments: 2,
    messageSize: 1136,
    totalSize: 1232,
    characters: 68,
    unicodeScalars: 69,
  },
  {
    testDescription: 'UCS-2 with four bytes extended characters in one segments boundary',
    body: '🏳️‍🌈2345678901234567890123456789012345678901234567890123456789012345',
    encoding: 'UCS-2',
    segments: 1,
    messageSize: 1120,
    totalSize: 1120,
    characters: 65,
    unicodeScalars: 68,
  },
  {
    testDescription: 'UCS-2 with four bytes extended characters in two segments boundary',
    body: '🏳️‍🌈23456789012345678901234567890123456789012345678901234567890123456',
    encoding: 'UCS-2',
    segments: 2,
    messageSize: 1136,
    totalSize: 1232,
    characters: 66,
    unicodeScalars: 69,
  },
];

describe('Smart Encoding', () => {
  test.each(Object.entries(SmartEncodingMap))('With Smart Encoding enabled - maps %s to %s', (key, value) => {
    const segmentedMessage = new SegmentedMessage(key, 'auto', true);
    expect(segmentedMessage.graphemes.join('')).toBe(value);
  });
  test.each(Object.entries(SmartEncodingMap))('With Smart Encoding disabled - does not modify %s', (key) => {
    const segmentedMessage = new SegmentedMessage(key, 'auto', false);
    expect(segmentedMessage.graphemes.join('')).toBe(key);
  });
  test('Replace all Smart Encoding chars at once', () => {
    const testString = Object.keys(SmartEncodingMap).join('');
    const expected = Object.values(SmartEncodingMap).join('');
    const segmentedMessage = new SegmentedMessage(testString, 'auto', true);
    expect(segmentedMessage.graphemes.join('')).toBe(expected);
  });
});

describe('Basic tests', () => {
  TestData.forEach((testMessage) => {
    test(testMessage.testDescription, () => {
      const segmentedMessage = new SegmentedMessage(testMessage.body);
      expect(segmentedMessage.encodingName).toBe(testMessage.encoding);
      expect(segmentedMessage.segments.length).toBe(testMessage.segments);
      expect(segmentedMessage.segmentsCount).toBe(testMessage.segments);
      expect(segmentedMessage.messageSize).toBe(testMessage.messageSize);
      expect(segmentedMessage.totalSize).toBe(testMessage.totalSize);
      expect(segmentedMessage.numberOfUnicodeScalars).toBe(testMessage.unicodeScalars);
      expect(segmentedMessage.numberOfCharacters).toBe(testMessage.characters);
    });
  });
});

describe('GSM-7 Escape Characters', () => {
  GSM7EscapeChars.forEach((escapeChar) => {
    test(`One segment with escape character ${escapeChar}`, () => {
      const segmentedMessage = new SegmentedMessage(
        `${escapeChar}12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678`,
      );
      expect(segmentedMessage.encodingName).toBe('GSM-7');
      expect(segmentedMessage.segments.length).toBe(1);
      expect(segmentedMessage.segmentsCount).toBe(1);
      expect(segmentedMessage.messageSize).toBe(1120);
      expect(segmentedMessage.totalSize).toBe(1120);
    });
    test(`Two segments with escape character ${escapeChar}`, () => {
      const segmentedMessage = new SegmentedMessage(
        `${escapeChar}123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789`,
      );
      expect(segmentedMessage.encodingName).toBe('GSM-7');
      expect(segmentedMessage.segments.length).toBe(2);
      expect(segmentedMessage.segmentsCount).toBe(2);
      expect(segmentedMessage.messageSize).toBe(1127);
      expect(segmentedMessage.totalSize).toBe(1223);
    });
  });
});

describe('One grapheme UCS-2 characters', () => {
  const testCharacters = ['Á', 'Ú', 'ú', 'ç', 'í', 'Í', 'ó', 'Ó'];
  testCharacters.forEach((character) => {
    test(`One segment, 70 characters of "${character}"`, () => {
      const testMessage = Array(70).fill(character).join('');
      const segmentedMessage = new SegmentedMessage(testMessage);
      expect(segmentedMessage.segmentsCount).toBe(1);
      segmentedMessage.encodedChars.forEach((encodedChar) => {
        expect(encodedChar.isGSM7).toBe(false);
      });
    });
  });

  testCharacters.forEach((character) => {
    test(`Two segments, 71 characters of "${character}"`, () => {
      const testMessage = Array(71).fill(character).join('');
      const segmentedMessage = new SegmentedMessage(testMessage);
      expect(segmentedMessage.segmentsCount).toBe(2);
      segmentedMessage.encodedChars.forEach((encodedChar) => {
        expect(encodedChar.isGSM7).toBe(false);
      });
    });
  });
});

describe('Special tests', () => {
  test('UCS2 message with special GSM characters in one segment', () => {
    // Issue #18: wrong segmnent calculation using GSM special characters
    const testMessage = '😀]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]';
    const segmentedMessage = new SegmentedMessage(testMessage);
    expect(segmentedMessage.segmentsCount).toBe(1);
  });

  test('UCS2 message with special GSM characters in two segment', () => {
    const testMessage = '😀]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]';
    const segmentedMessage = new SegmentedMessage(testMessage);
    expect(segmentedMessage.segmentsCount).toBe(2);
  });
});

describe('Line break styles tests', () => {
  test('Message with CRLF line break style and auto line break style detection', () => {
    const testMessage = '\rabcde\r\n123';
    const segmentedMessage = new SegmentedMessage(testMessage);
    expect(segmentedMessage.numberOfCharacters).toBe(11);
  });

  test('Message with LF line break style and auto line break style detection', () => {
    const testMessage = '\nabcde\n\n123\n';
    const segmentedMessage = new SegmentedMessage(testMessage);
    expect(segmentedMessage.numberOfCharacters).toBe(12);
  });

  test('Triple accents characters - Unicode test', () => {
    const testMessage = 'é́́';
    const segmentedMessage = new SegmentedMessage(testMessage);
    expect(segmentedMessage.numberOfCharacters).toBe(1);
    expect(segmentedMessage.numberOfUnicodeScalars).toBe(4);
  });

  // Test for https://github.com/TwilioDevEd/message-segment-calculator/issues/17
  test('Triple accents characters - One Segment test', () => {
    const testMessage = 'é́́aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const segmentedMessage = new SegmentedMessage(testMessage);
    expect(segmentedMessage.segmentsCount).toBe(1);
  });

  test('Triple accents characters - Two Segments test', () => {
    const testMessage = 'é́́aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const segmentedMessage = new SegmentedMessage(testMessage);
    expect(segmentedMessage.segmentsCount).toBe(2);
  });
});

describe('Line Break Detection Tests', () => {
  test('Pure CRLF detected correctly (not as mixed)', () => {
    const testMessage = 'Hello\r\nWorld\r\n';
    const segmentedMessage = new SegmentedMessage(testMessage);
    expect(segmentedMessage.lineBreakStyle).toBe('CRLF'); // NOT 'LF+CRLF'
  });

  test('Pure LF detected correctly', () => {
    const testMessage = 'Hello\nWorld\n';
    const segmentedMessage = new SegmentedMessage(testMessage);
    expect(segmentedMessage.lineBreakStyle).toBe('LF');
  });

  test('Mixed LF and CRLF detected correctly', () => {
    const testMessage = 'Hello\r\nWorld\nTest';
    const segmentedMessage = new SegmentedMessage(testMessage);
    expect(segmentedMessage.lineBreakStyle).toBe('LF+CRLF');
  });

  test('No line breaks detected correctly', () => {
    const testMessage = 'Hello World';
    const segmentedMessage = new SegmentedMessage(testMessage);
    expect(segmentedMessage.lineBreakStyle).toBeUndefined();
  });
});

describe('CRLF Warning Tests', () => {
  test('CRLF line breaks generate appropriate warning', () => {
    const testMessage = 'Hello\r\nWorld\r\n';
    const segmentedMessage = new SegmentedMessage(testMessage);
    expect(segmentedMessage.warnings.length).toBe(1);
    expect(segmentedMessage.warnings[0]).toContain('CRLF');
    expect(segmentedMessage.warnings[0]).toContain('2 characters');
    expect(segmentedMessage.warnings[0]).not.toContain('converted to LF');
  });

  test('LF line breaks generate no warning', () => {
    const testMessage = 'Hello\nWorld\n';
    const segmentedMessage = new SegmentedMessage(testMessage);
    expect(segmentedMessage.warnings.length).toBe(0);
  });

  test('Mixed line break styles generate appropriate warning', () => {
    const testMessage = 'Hello\r\nWorld\nTest';
    const segmentedMessage = new SegmentedMessage(testMessage);
    expect(segmentedMessage.warnings.length).toBe(1);
    expect(segmentedMessage.warnings[0]).toContain('mixed');
    expect(segmentedMessage.warnings[0]).toContain('LF and CRLF');
  });

  test('Message without line breaks generates no warning', () => {
    const testMessage = 'Hello World';
    const segmentedMessage = new SegmentedMessage(testMessage);
    expect(segmentedMessage.warnings.length).toBe(0);
  });
});

describe('CRLF Segment Calculation Tests', () => {
  test('CRLF increases character count correctly', () => {
    const testMessage = 'Hi\r\n'; // H, i, \r, \n = 4 chars
    const segmentedMessage = new SegmentedMessage(testMessage);
    expect(segmentedMessage.numberOfCharacters).toBe(4);
  });

  test('CRLF message correctly calculates 2 segments', () => {
    // User's example: 162 chars with CRLF should be 2 segments
    const testMessage = "Ce weekend c'est Big Kiff ! Découvrez vite 4 nouveaux menus à partager:\r\nl.dominos.fr/MqGKjT0Vi2\r\nConditions sur le site Domino's.\r\nSTOP : l.dominos.fr/oIv05Yymdm";
    const segmentedMessage = new SegmentedMessage(testMessage);
    expect(segmentedMessage.numberOfCharacters).toBe(162);
    expect(segmentedMessage.segmentsCount).toBe(2);
  });

  test('Same message with LF uses fewer characters and segments', () => {
    // Same message with LF should be 159 chars and 1 segment
    const testMessage = "Ce weekend c'est Big Kiff ! Découvrez vite 4 nouveaux menus à partager:\nl.dominos.fr/MqGKjT0Vi2\nConditions sur le site Domino's.\nSTOP : l.dominos.fr/oIv05Yymdm";
    const segmentedMessage = new SegmentedMessage(testMessage);
    expect(segmentedMessage.numberOfCharacters).toBe(159);
    expect(segmentedMessage.segmentsCount).toBe(1);
  });
});
