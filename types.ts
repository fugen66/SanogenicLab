
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export enum AppState {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
}

export enum AppTab {
  ANALYSIS = 'Analysis',
  JOURNAL = 'Journal',
  METAPHOR = 'Metaphor'
}

export interface PsychologicalInsight {
  originalThought: string;
  distortions: string[];
  analysis: string;
  reframedThought: string;
  suggestedAction: string;
  shieldTechnique: string;
}

export interface EmotionEntry {
  emotion: string;
  intensity: number;
  reflection: string;
  advice: string;
}

export interface MetaphorResult {
  title: string;
  story: string;
  moral: string;
}

export enum AspectRatio {
  SQUARE = '1:1',
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
  PHOTO = '4:3',
}

export enum GenerationMode {
  TEXT_TO_IMAGE = 'Text-to-Image',
  IMAGE_TO_IMAGE = 'Image-to-Image',
}

export enum ImageModel {
  FLASH = 'gemini-2.5-flash-image',
  PRO = 'gemini-3-pro-image-preview',
}

export interface ImageFile {
  file: File;
  base64: string;
}

export interface GenerateImageParams {
  prompt: string;
  model: ImageModel;
  aspectRatio: AspectRatio;
  mode: GenerationMode;
  numberOfImages: number;
  inputImage: ImageFile | null;
}

export interface ImageResultItem {
  objectUrl: string;
}
