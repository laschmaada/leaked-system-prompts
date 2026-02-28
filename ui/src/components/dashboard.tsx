'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect } from 'react';
import { PromptData } from '@/lib/prompts';
import { Search, List, MessageSquare, Key, Moon, Sun, Copy, Check, ExternalLink, ChevronRight, LayoutDashboard, Send, Trash2, Settings2, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard({ prompts }: { prompts: PromptData[] }) {
  const [activeTab, setActiveTab] = useState<'browse' | 'playground' | 'settings'>('browse');
  const [selectedPrompt, setSelectedPrompt] = useState<PromptData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { theme, setTheme } = useTheme();

  // API Keys Map: { [providerName]: apiKey }
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  useEffect(() => {
    const storedKeys = localStorage.getItem('prompt_leaks_api_keys');
    if (storedKeys) {
        setApiKeys(JSON.parse(storedKeys));
    } else {
        // Migration for old keys
        const oldOpenai = localStorage.getItem('openai_key');
        const oldAnthropic = localStorage.getItem('anthropic_key');
        if (oldOpenai || oldAnthropic) {
            const newKeys = {
                OpenAI: oldOpenai || '',
                Anthropic: oldAnthropic || ''
            };
            setApiKeys(newKeys);
            localStorage.setItem('prompt_leaks_api_keys', JSON.stringify(newKeys));
        }
    }

    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  const saveKeys = () => {
    localStorage.setItem('prompt_leaks_api_keys', JSON.stringify(apiKeys));
    alert('All API keys saved locally!');
  };

  const updateApiKey = (provider: string, key: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: key }));
  };

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newFavorites = favorites.includes(id)
      ? favorites.filter(fav => fav !== id)
      : [...favorites, id];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const currentProvider = selectedPrompt?.provider || 'OpenAI';
  const currentKey = apiKeys[currentProvider] || '';

  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading } = useChat({
    // @ts-ignore
    api: '/api/chat',
    body: {
      systemPrompt: selectedPrompt?.content,
      provider: currentProvider,
      modelName: selectedPrompt?.model,
      apiKey: currentKey,
    },
  });

  const filteredPrompts = prompts.filter(p => {
    if (searchQuery === 'is:favorite') return favorites.includes(p.id);
    return p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           p.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
           p.model.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const providers = Array.from(new Set(prompts.map(p => p.provider))).sort();

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
        case 'openai': return 'bg-black text-white';
        case 'anthropic': return 'bg-[#D97757] text-white';
        case 'xai': return 'bg-blue-600 text-white';
        case 'meta': return 'bg-blue-500 text-white';
        case 'google': return 'bg-red-500 text-white';
        default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getProviderInitials = (provider: string) => {
    return provider.substring(0, 3).toUpperCase();
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border flex flex-col bg-card">
        <div className="p-6 border-b border-border flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">PromptLeaks</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => {
                setActiveTab('browse');
                setSearchQuery('');
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm",
              activeTab === 'browse' && searchQuery === '' ? "bg-secondary text-secondary-foreground" : "hover:bg-muted text-muted-foreground"
            )}
          >
            <List className="w-4 h-4" />
            <span className="font-medium">Browse Prompts</span>
          </button>
          {favorites.length > 0 && (
            <button
                onClick={() => {
                    setActiveTab('browse');
                    setSearchQuery('is:favorite');
                }}
                className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm",
                searchQuery === 'is:favorite' ? "bg-secondary text-secondary-foreground" : "hover:bg-muted text-muted-foreground"
                )}
            >
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-medium">Favorites</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('playground')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm",
              activeTab === 'playground' ? "bg-secondary text-secondary-foreground" : "hover:bg-muted text-muted-foreground"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="font-medium">AI Playground</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm",
              activeTab === 'settings' ? "bg-secondary text-secondary-foreground" : "hover:bg-muted text-muted-foreground"
            )}
          >
            <Key className="w-4 h-4" />
            <span className="font-medium">API Keys</span>
          </button>

          <div className="pt-4 pb-2 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Providers
          </div>
          {providers.map(provider => (
            <button
              key={provider}
              onClick={() => {
                setActiveTab('browse');
                setSearchQuery(provider);
              }}
              className="w-full flex items-center justify-between gap-3 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <span>{provider}</span>
              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full border border-border">
                {prompts.filter(p => p.provider === provider).length}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
           <a
            href="https://github.com/linexjlin/leaked-system-prompts"
            target="_blank"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-muted-foreground transition-colors text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="font-medium">Original Repo</span>
          </a>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-muted-foreground transition-colors text-sm"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="font-medium capitalize">{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <AnimatePresence mode="wait">
        {activeTab === 'browse' && (
          <motion.div
            key="browse"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col h-full overflow-hidden"
          >
            <header className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">System Prompts</h1>
                <p className="text-muted-foreground text-sm">Explore {prompts.length} leaked system prompts.</p>
              </div>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search prompts..."
                  className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  value={searchQuery === 'is:favorite' ? '' : searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredPrompts.map(prompt => (
                  <div
                    key={prompt.id}
                    className={cn(
                        "p-4 border border-border rounded-lg bg-card hover:border-primary transition-all cursor-pointer group flex flex-col",
                        selectedPrompt?.id === prompt.id && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedPrompt(prompt)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-[10px] font-bold uppercase">
                            {prompt.provider}
                        </span>
                        {favorites.includes(prompt.id) && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">{prompt.date}</span>
                    </div>
                    <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors line-clamp-1">{prompt.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-3 mb-4 flex-1">
                        {prompt.content.substring(0, 200)}...
                    </p>
                    <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(prompt.content, prompt.id);
                            }}
                            className="text-[10px] flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors font-medium"
                        >
                            {copiedId === prompt.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                            {copiedId === prompt.id ? 'Copied' : 'Copy'}
                        </button>
                        <button
                             onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPrompt(prompt);
                                setActiveTab('playground');
                            }}
                            className="text-[10px] flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors font-medium"
                        >
                            <MessageSquare className="w-3 h-3" />
                            Test
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prompt Detail Drawer */}
            <AnimatePresence>
            {selectedPrompt && (
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="absolute right-0 top-0 bottom-0 w-1/3 bg-card border-l border-border shadow-2xl flex flex-col z-20"
                >
                    <header className="p-6 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-3 truncate pr-4">
                            <button
                                onClick={(e) => toggleFavorite(e, selectedPrompt.id)}
                                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-amber-400 transition-colors"
                            >
                                <Star className={cn("w-5 h-5", favorites.includes(selectedPrompt.id) && "fill-amber-400 text-amber-400")} />
                            </button>
                            <h2 className="font-bold text-xl truncate">{selectedPrompt.title}</h2>
                        </div>
                        <button
                            onClick={() => setSelectedPrompt(null)}
                            className="p-1 rounded-md hover:bg-muted"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </header>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="flex flex-wrap gap-4">
                            <div className="bg-muted p-2 rounded-md">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Provider</span>
                                <span className="text-xs font-semibold">{selectedPrompt.provider}</span>
                            </div>
                            <div className="bg-muted p-2 rounded-md">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Model</span>
                                <span className="text-xs font-semibold">{selectedPrompt.model}</span>
                            </div>
                            <div className="bg-muted p-2 rounded-md">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Date</span>
                                <span className="text-xs font-semibold">{selectedPrompt.date}</span>
                            </div>
                        </div>
                        <div>
                             <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground block">System Prompt</span>
                                <button
                                    onClick={() => copyToClipboard(selectedPrompt.content, 'drawer')}
                                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {copiedId === 'drawer' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                             </div>
                             <div className="p-4 bg-muted rounded-md border border-border">
                                <pre className="text-[11px] whitespace-pre-wrap font-mono break-words leading-relaxed text-muted-foreground">
                                    {selectedPrompt.content}
                                </pre>
                             </div>
                        </div>
                        {selectedPrompt.source && (
                            <div>
                                <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-2">Source Information</span>
                                <a
                                    href={selectedPrompt.source}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline flex items-center gap-1 bg-muted p-2 rounded-md truncate"
                                >
                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{selectedPrompt.source}</span>
                                </a>
                            </div>
                        )}
                    </div>
                    <div className="p-6 border-t border-border">
                        <button
                             onClick={() => setActiveTab('playground')}
                             className="w-full bg-primary text-primary-foreground py-2.5 rounded-md font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Open in Playground
                        </button>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
          </motion.div>
        )}

        {activeTab === 'playground' && (
          <motion.div
            key="playground"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col h-full bg-muted/30"
          >
             <header className="p-6 border-b border-border flex items-center justify-between bg-card">
              <div>
                <h1 className="text-2xl font-bold">AI Playground</h1>
                <p className="text-muted-foreground text-sm">
                    {selectedPrompt ? `Testing: ${selectedPrompt.title}` : 'Select a prompt to start chatting'}
                </p>
              </div>
              <div className="flex gap-2">
                 <button
                    onClick={() => setMessages([])}
                    className="p-2 border border-border rounded-md hover:bg-muted text-muted-foreground"
                    title="Clear chat"
                 >
                    <Trash2 className="w-4 h-4" />
                 </button>
                 <button
                    onClick={() => setActiveTab('browse')}
                    className="px-4 py-2 border border-border rounded-md hover:bg-muted text-sm font-medium flex items-center gap-2"
                 >
                    <List className="w-4 h-4" />
                    Change Prompt
                 </button>
              </div>
            </header>

            <div className="flex-1 flex flex-col items-center p-6 overflow-hidden">
                {!selectedPrompt ? (
                    <div className="text-center space-y-4 max-w-md my-auto">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                            <MessageSquare className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-bold">No prompt selected</h2>
                        <p className="text-muted-foreground">Select a system prompt from the library to test it out in the playground.</p>
                        <button
                            onClick={() => setActiveTab('browse')}
                            className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium"
                        >
                            Browse Prompts
                        </button>
                    </div>
                ) : (
                    <div className="w-full max-w-4xl flex-1 flex flex-col bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                        <div className="bg-muted/50 px-6 py-2 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase text-muted-foreground">System Prompt:</span>
                                <span className="text-[10px] font-medium truncate max-w-[300px]">{selectedPrompt.title}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <div className={cn("w-2 h-2 rounded-full", currentKey ? "bg-green-500" : "bg-red-500")} />
                                    <span className="text-[10px] font-bold text-muted-foreground">{currentProvider} API</span>
                                </div>
                                <button onClick={() => setActiveTab('settings')} className="text-muted-foreground hover:text-foreground">
                                    <Settings2 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                            {messages.length === 0 && (
                                <div className="text-center py-12 space-y-2">
                                    <div className="text-muted-foreground text-sm font-medium">Chat is empty</div>
                                    <p className="text-xs text-muted-foreground/60 max-w-xs mx-auto">
                                        Send a message to see how the AI responds with the {selectedPrompt.title} system prompt active.
                                    </p>
                                </div>
                            )}
                            {(messages || []).map((m: any) => (
                                <div key={m.id} className={cn("flex gap-4", m.role === 'user' ? "justify-end" : "justify-start")}>
                                    {m.role !== 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 border border-border">
                                            <span className="text-[10px] font-bold">AI</span>
                                        </div>
                                    )}
                                    <div className={cn(
                                        "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                                        m.role === 'user'
                                            ? "bg-primary text-primary-foreground rounded-tr-none shadow-sm"
                                            : "bg-muted/50 border border-border rounded-tl-none"
                                    )}>
                                        {m.content}
                                    </div>
                                    {m.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 border border-border shadow-sm">
                                            <span className="text-[10px] font-bold text-primary-foreground">YOU</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-4 justify-start animate-pulse">
                                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 border border-border">
                                        <span className="text-[10px] font-bold text-muted-foreground">...</span>
                                    </div>
                                    <div className="max-w-[80%] p-4 bg-muted/30 border border-border rounded-2xl rounded-tl-none">
                                        <div className="h-4 w-24 bg-muted rounded"></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card">
                             <div className="relative max-w-3xl mx-auto">
                                <textarea
                                    value={input}
                                    onChange={handleInputChange}
                                    placeholder={currentKey ? "Message the AI..." : "Please configure API key in settings first..."}
                                    disabled={!currentKey || isLoading}
                                    className="w-full pl-4 pr-12 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none disabled:opacity-50"
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e as any);
                                        }
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={!currentKey || !input.trim() || isLoading}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 transition-opacity"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                             </div>
                        </form>
                    </div>
                )}
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col h-full bg-muted/30 p-12 overflow-y-auto"
          >
             <div className="max-w-2xl mx-auto w-full space-y-8 pb-12">
                <div>
                    <h1 className="text-3xl font-bold mb-2">API Configuration</h1>
                    <p className="text-muted-foreground text-sm">Configure your API keys to enable the AI Playground. Your keys are stored <strong>locally in your browser's localStorage</strong> and are only used for requests from this application.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {providers.map(provider => (
                        <div key={provider} className="p-6 bg-card border border-border rounded-xl shadow-sm space-y-4 hover:border-primary/50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center font-bold text-[10px]", getProviderColor(provider))}>
                                        {getProviderInitials(provider)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm">{provider}</h3>
                                        <p className="text-[10px] text-muted-foreground line-clamp-1">{provider} models</p>
                                    </div>
                                </div>
                                {apiKeys[provider] && <Check className="w-4 h-4 text-green-500" />}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">API KEY</label>
                                <input
                                    type="password"
                                    value={apiKeys[provider] || ''}
                                    onChange={(e) => updateApiKey(provider, e.target.value)}
                                    placeholder="Enter key..."
                                    className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="sticky bottom-0 bg-muted/80 backdrop-blur-sm p-4 border-t border-border -mx-12 mt-8 flex justify-center">
                    <button
                        onClick={saveKeys}
                        className="max-w-md w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:opacity-90 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        Save All Configurations
                    </button>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
                    <p className="text-[11px] text-amber-800 dark:text-amber-200 leading-relaxed">
                        <strong>Note:</strong> The playground currently supports OpenAI, Anthropic, Google (Gemini), xAI (Grok), Mistral, and Groq. Other providers may fallback to OpenAI format if a key is provided.
                    </p>
                </div>
             </div>
          </motion.div>
        )}
        </AnimatePresence>
      </main>
    </div>
  );
}
