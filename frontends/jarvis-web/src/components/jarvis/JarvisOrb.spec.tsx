import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JarvisOrb } from '@/components/jarvis/JarvisOrb';
import { useJarvisStore } from '@/stores/jarvis.store';

describe('JarvisOrb', () => {
  it('renderiza o orb com letra J', () => {
    useJarvisStore.setState({ isListening: false, isSpeaking: false, isLoading: false });
    render(<JarvisOrb />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('mostra status Ouvindo quando isListening', () => {
    useJarvisStore.setState({ isListening: true, isSpeaking: false, isLoading: false });
    render(<JarvisOrb />);
    expect(screen.getByText('Ouvindo...')).toBeInTheDocument();
  });

  it('mostra status Processando quando isLoading', () => {
    useJarvisStore.setState({ isListening: false, isSpeaking: false, isLoading: true });
    render(<JarvisOrb />);
    expect(screen.getByText('Processando...')).toBeInTheDocument();
  });
});
