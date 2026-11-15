import { Icon } from '../design/Icon';
import type { Progress } from '../lib/progress';
import { t, type StringKey } from '../lib/strings';

type Props = { progress: Progress; onChange: (patch: Partial<Progress>) => void; onPlacement: () => void; onBack: () => void };

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

export function Settings({ progress, onChange, onPlacement, onBack }: Props) {
  const lang = progress.lang;
  const theme = (key: StringKey, value: Progress['theme']) => ({ value, label: t(key, lang) });
  return (
    <div className="screen">
      <header className="subhead">
        <button type="button" className="icon-btn" aria-label={t('back', lang)} onClick={onBack}>
          <Icon name="back" />
        </button>
        <h1 className="subhead-title">{t('settings', lang)}</h1>
      </header>
      <main className="screen-body list">
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
      <button type="button" className="row" onClick={onPlacement}>
        <span className="row-icon">
          <Icon name="target" />
        </span>
        <span className="row-text">
          <span className="row-title">{t('placement', lang)}</span>
          <span className="row-sub">{t('testOptional', lang)}</span>
        </span>
        <span className="row-chevron">
          <Icon name="chevron-right" />
        </span>
      </button>
      </main>
    </div>
  );
}
