import type { Progress } from '../lib/progress';
import { t, type StringKey } from '../lib/strings';

type Props = { progress: Progress; onChange: (patch: Partial<Progress>) => void; onPlacement: () => void };

type GroupProps<T extends string | number> = {
  label: string;
  name: string;
  value: T;
  options: { value: T; label: string }[];
  onPick: (value: T) => void;
};

/** One setting with a few exclusive choices, as native radios so keyboard and screen readers work unaided. */
function Group<T extends string | number>({ label, name, value, options, onPick }: GroupProps<T>) {
  return (
    <fieldset className="setting">
      <legend>{label}</legend>
      <div className="segmented">
        {options.map((o) => (
          <label key={o.value} className="segment">
            <input type="radio" name={name} checked={o.value === value} onChange={() => onPick(o.value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Settings({ progress, onChange, onPlacement }: Props) {
  const lang = progress.lang;
  const theme = (key: StringKey, value: Progress['theme']) => ({ value, label: t(key, lang) });
  return (
    <main className="page">
      <h1 className="page-title">{t('settings', lang)}</h1>
      <Group
        label={t('language', lang)}
        name="lang"
        value={lang}
        options={[
          { value: 'en', label: 'English' },
          { value: 'fi', label: 'Suomi' },
        ]}
        onPick={(v) => onChange({ lang: v })}
      />
      <Group
        label={t('dailyGoal', lang)}
        name="goal"
        value={progress.goal}
        options={[10, 20, 30].map((g) => ({ value: g, label: `${g} ${t('xp', lang)}` }))}
        onPick={(v) => onChange({ goal: v })}
      />
      <Group
        label={t('theme', lang)}
        name="theme"
        value={progress.theme}
        options={[theme('themeAuto', 'auto'), theme('themeLight', 'light'), theme('themeDark', 'dark')]}
        onPick={(v) => onChange({ theme: v })}
      />
      <label className="setting switch-row">
        <span>{t('haptics', lang)}</span>
        <input
          type="checkbox"
          role="switch"
          className="switch"
          checked={progress.haptics}
          onChange={(e) => onChange({ haptics: e.target.checked })}
        />
      </label>
      <div className="setting switch-row">
        <span>{t('placement', lang)}</span>
        <button type="button" className="btn btn-secondary" onClick={onPlacement}>
          {t('retake', lang)}
        </button>
      </div>
    </main>
  );
}
