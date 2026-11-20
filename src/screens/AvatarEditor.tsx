import { useState } from 'react';
import { Avatar, Icon, type IconName } from '../design/Icon';
import { accessories, animals, bgStyles, colours, expressions, lookColour, lookString, parseLook, type Look } from '../design/avatar';
import { haptic } from '../lib/haptics';
import type { Lang } from '../lib/types';
import { t, type StringKey } from '../lib/strings';

type Props = { saved: string; lang: Lang; onSave: (avatar: string) => void; onClose: () => void };

// Full-screen editor: preview on top, one tab per picker, changes stay a draft until Save.
export function AvatarEditor({ saved, lang, onSave, onClose }: Props) {
  const [look, setLook] = useState(() => parseLook(saved));
  const [tab, setTab] = useState(0);
  const [field, label, table] = pickers[tab];
  return (
    <div className="lesson avatar-screen">
      <header className="lesson-top">
        <button type="button" className="icon-btn icon-btn-outline" aria-label={t('close', lang)} onClick={onClose}>
          <Icon name="close" />
        </button>
        <h1 className="lesson-title">{t('avatar', lang)}</h1>
      </header>

      <div className="avatar-stage block" data-tone={lookColour(look).tone}>
        <Avatar look={look} size={160} className="avatar profile-avatar" />
      </div>

      <div className="avatar-tabs" role="tablist" aria-label={t('avatar', lang)}>
        {pickers.map(([f, l, , icon], i) => (
          <button
            key={f}
            type="button"
            role="tab"
            id={`avatar-tab-${f}`}
            aria-controls="avatar-panel"
            aria-selected={i === tab}
            aria-label={t(l, lang)}
            className="avatar-tab"
            onClick={() => setTab(i)}
          >
            <Icon name={icon} size={26} />
          </button>
        ))}
      </div>

      <main className="avatar-panel" id="avatar-panel" role="tabpanel" aria-labelledby={`avatar-tab-${field}`}>
        <h2 className="avatar-picker-label">{t(label, lang)}</h2>
        <div className="avatar-grid" role="radiogroup" aria-label={t(label, lang)}>
          {Object.entries(table).map(([key, option]) => {
            // each choice previews the current look with only that part changed
            const next = { ...look, [field]: key };
            return (
              <button
                key={key}
                type="button"
                role="radio"
                className="avatar-option"
                // colour '' is the animal's own, so that swatch shows as chosen
                aria-checked={(field === 'colour' ? look.colour || animals[look.animal].bg : look[field]) === key}
                aria-label={option.label[lang]}
                onClick={() => {
                  haptic('tap');
                  setLook(next);
                }}
              >
                <Avatar look={next} size={64} className="avatar" />
              </button>
            );
          })}
        </div>
      </main>

      <footer className="action">
        <button
          type="button"
          className="btn btn-primary btn-block"
          disabled={lookString(look) === lookString(parseLook(saved))}
          onClick={() => onSave(lookString(look))}
        >
          {t('save', lang)}
        </button>
      </footer>
    </div>
  );
}

const pickers = [
  ['animal', 'avatarAnimal', animals, 'paw'],
  ['colour', 'avatarColour', colours, 'drop'],
  ['style', 'avatarStyle', bgStyles, 'image'],
  ['expression', 'avatarExpression', expressions, 'smile'],
  ['accessory', 'avatarAccessory', accessories, 'bowtie'],
] as const satisfies readonly (readonly [keyof Look, StringKey, Record<string, { label: Record<Lang, string> }>, IconName])[];
