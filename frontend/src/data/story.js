export const storyChapters = {
  'boot-sequence': {
    id: 'boot-sequence',
    title: 'Chapter 0: The Null Exception',
    panels: [
      {
        id: 'p1',
        type: 'cinematic',
        visual: 'cityscape',
        systemText: 'SYSTEM DOMAIN: FRAGMENTED.',
        glitch: true,
      },
      {
        id: 'p2',
        type: 'character',
        visual: 'user-awakens',
        systemText: 'UNINITIALIZED ENTITY DETECTED.',
        glitch: false,
      },
      {
        id: 'p3',
        type: 'enemy',
        visual: 'goblin-encounter',
        systemText: '[WARNING: CORRUPTED LOGIC DETECTED.]',
        alert: true,
      },
      {
        id: 'p4',
        type: 'action',
        visual: 'summon-terminal',
        systemText: 'RESTORE THE SEQUENCE.',
        glitch: true,
      },
      {
        id: 'p5',
        type: 'resolution',
        visual: 'slash',
        systemText: '[SEQUENCE REPAIRED.]\n[YOU HAVE UNLOCKED: ARRAYS.]',
        success: true,
      }
    ]
  }
};
