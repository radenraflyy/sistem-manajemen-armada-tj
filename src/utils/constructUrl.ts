type ConfigType = {
  params?: Record<string, string>;
  query?: Record<string, unknown>;
};

export const constructUrl = (baseUrl: string, config: ConfigType = {}): string =>
  baseUrl.replaceAll(/\/:([\w]+)/g, (_segment, parameter: string) => {
    const value = config.params?.[parameter] ?? 'undefined';
    return `/${encodeURIComponent(value)}`;
  });
