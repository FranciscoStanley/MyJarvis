import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatPanel } from '@/components/jarvis/ChatPanel';
import { useJarvisStore } from '@/stores/jarvis.store';

describe('ChatPanel', () => {
  it('mostra mensagem de boas-vindas quando vazio', () => {
    useJarvisStore.setState({ messages: [] });
    render(<ChatPanel />);
    expect(screen.getByText(/Bom dia, senhor/)).toBeInTheDocument();
  });

  it('renderiza mensagens do usuário e JARVIS', () => {
    useJarvisStore.setState({
      messages: [
        { id: '1', role: 'user', content: 'Olá', timestamp: new Date() },
        { id: '2', role: 'assistant', content: 'Bom dia.', timestamp: new Date() },
      ],
    });
    render(<ChatPanel />);
    expect(screen.getByText('Olá')).toBeInTheDocument();
    expect(screen.getByText('Bom dia.')).toBeInTheDocument();
    expect(screen.getByText('JARVIS')).toBeInTheDocument();
  });
});
