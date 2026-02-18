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
  ANALYSIS = 'РАЗБОР',
  JOURNAL = 'ЭМОЦИИ',
  METAPHOR = 'ПРИТЧА'
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

// Fix: Add missing AspectRatio enum for image/video generation components
export enum AspectRatio {
  SQUARE = '1:1',
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
  PHOTO = '4:3',
}

// Fix: Add missing GenerationMode enum
export enum GenerationMode {
  TEXT_TO_IMAGE = 'Text-to-Image',
  IMAGE_TO_IMAGE = 'Image-to-Image',
}

// Fix: Add missing ImageModel enum following Gemini API guidelines
export enum ImageModel {
  FLASH = 'gemini-2.5-flash-image',
  PRO = 'gemini-3-pro-image-preview',
}

// Fix: Add missing ImageFile interface for handling base64 uploads
export interface ImageFile {
  file: File;
  base64: string;
}

// Fix: Add missing GenerateImageParams interface
export interface GenerateImageParams {
  prompt: string;
  model: ImageModel;
  aspectRatio: AspectRatio;
  mode: GenerationMode;
  numberOfImages: number;
  inputImage: ImageFile | null;
}

// Fix: Add missing ImageResultItem interface used in galleries
export interface ImageResultItem {
  objectUrl: string;
}
