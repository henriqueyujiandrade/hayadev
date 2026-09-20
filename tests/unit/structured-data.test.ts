import { describe, expect, it } from 'vitest';

import { stack } from '@config/stack';
import { personSchema, stackSkills } from '@utils/structured-data';

describe('stackSkills', () => {
  it('lists every technology on the visible stack, exactly once', () => {
    const skills = stackSkills();

    expect(new Set(skills).size).toBe(skills.length);
    for (const group of stack) {
      for (const item of group.items) expect(skills).toContain(item);
    }
  });

  it('keeps related skills as separate, explicit entries', () => {
    /* A job ad may ask for Node.js, NestJS or Django REST Framework by name. */
    expect(stackSkills()).toEqual(
      expect.arrayContaining(['Python', 'Django', 'Django REST Framework', 'Node.js', 'NestJS']),
    );
  });
});

describe('personSchema', () => {
  it('publishes the same skills the visible stack shows', () => {
    expect(personSchema('pt-BR').knowsAbout).toEqual(stackSkills());
  });
});
