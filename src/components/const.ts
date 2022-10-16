import familyTree from '../json/familyTree.json';
import type { Node } from 'relatives-tree/lib/types';

export const NODE_WIDTH = 70;
export const NODE_HEIGHT = 80;

export const SOURCES = {
  'tree': familyTree,
} as Readonly<{ [key: string]: readonly Readonly<Node>[] }>;

export const DEFAULT_SOURCE = Object.keys(SOURCES)[0];
