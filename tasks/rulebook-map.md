# Rulebook map

Which grammar rules each unit adds to `content/rules.json`. Written on 2026-11-13 from
the two textbooks' tables of contents and the topic index of
https://uusikielemme.fi/finnish-grammar (14 index and list pages read; the single
articles were not opened).

How to use it: when a unit's content is written, each line below becomes one rule
entry with its own original examples, and at least 4 exercises are tagged with it.
A rule enters `rules.json` only together with its exercises, because the validator
rejects rules with fewer than 4. This file is the plan; `rules.json` is the truth.

Only the fact "word X demands form Y" is taken from the reference site. Explanations
and example sentences are written new. Each rule may carry a `ref` link to the
matching article for further reading.

Status: unit 1 is built. Everything else is planned and may be reordered.

## Rule types

| Type | Covers |
|---|---|
| `phonology` | vowel harmony, spelling |
| `verbtype` | verb types 1 to 6, olla, negative verb |
| `wordtype` | how a noun or adjective type builds its stem (nainen: naise-) |
| `gradation` | consonant gradation (KPT) in verbs and nouns |
| `case` | when a case is used, and how it is formed |
| `rektio` | the case or infinitive a verb, adjective or noun demands |
| `object` | partitive or total object |
| `tense` | imperfekti, perfekti, pluskvamperfekti, passive tenses |
| `mood` | imperative, conditional, potential |
| `sentence` | sentence types: possession, existential, necessity, result |
| `construction` | infinitives, participles, clause equivalents |
| `clitic` | -ko/-kö, -kin, -kaan, -han, -pa |

## Case names in the validator

`rektio` rules name the demanded form with Voikko's terms, confirmed on this machine.

| Case | Ending | Voikko name |
|---|---|---|
| nominative | (none) | `nimento` |
| genitive | -n | `omanto` |
| partitive | -a, -ta, -tta | `osanto` |
| inessive | -ssa | `sisaolento` |
| elative | -sta | `sisaeronto` |
| illative | -Vn, -hVn, -seen | `sisatulento` |
| adessive | -lla | `ulkoolento` |
| ablative | -lta | `ulkoeronto` |
| allative | -lle | `ulkotulento` |
| essive | -na | `olento` |
| translative | -ksi | `tulento` |
| abessive | -tta | `vajanto` |
| instructive | -in | `keinonto` |

Infinitives use `requiresMood`: `A-infinitive` (tehdä) and `MA-infinitive` (tekemään,
tekemässä, tekemästä; combined with `requires` for the case).

## Section 1: Starter

| Unit | Rules to add |
|---|---|
| 1 Hello | `olla-present` (verbtype), `vowel-harmony` (phonology) — built |
| 2 About me | `verbtype-1` (puhua, asua), `question-ko` (clitic), `question-words` (sentence: mikä, missä, mistä, kuka), `negative-verb` (verbtype: en, et, ei) |
| 3 Food | `verbtype-2` (syödä, juoda), `partitive-form` (case: -a, -ta, -tta by word type), `partitive-amount` (case: after numbers and measures), `partitive-mass` (object: food and drink), `rektio-pitaa-sta`, `rektio-tykata-sta` |
| 4 Home | `inessive-ssa` (case), `existential` (sentence: Keittiössä on pöytä), `possession-lla-on` (sentence: minulla on), `adjective-agreement` (case), `partitive-negative` (object: ei ole + partitive) |
| 5 Family | `genitive-form` (case), `possessive-suffix` (case), `demonstratives` (case: tämä, tuo, se), `wordtype-nen` (nainen: naise-), `wordtype-e` (huone: huonee-), `wordtype-i-new` (bussi: bussi-), `wordtype-i-old` (ovi: ove-), `wordtype-si` (uusi: uude-), `lla-vs-n` (sentence: minulla on vs minun) |
| 6 My day | `verbtype-3` (tulla, mennä), `verbtype-4` (haluta, herätä), `verbtype-5` (tarvita), `gradation-verbtype-1` (nukkua: nukun), `gradation-verbtype-3-4` (tavata: tapaan), `illative-form` (case), `rektio-kayda-ssa`, `rektio-menna-hin`, `rektio-tulla-sta`, `pronoun-partitive` (case: minua, sinua) |

## Section 2: Basics

| Unit | Rules to add |
|---|---|
| 7 Getting around | `gradation-noun-a` (kauppa: kaupassa), `gradation-noun-b` (osoite: osoitteessa), `ssa-vs-lla` (case), `local-cases-six` (case: missä, mistä, mihin), `rektio-odottaa-part`, `rektio-rakastaa-part`, `rektio-auttaa-part`, `rektio-etsia-part`, `rektio-katsoa-part`, `rektio-kuunnella-part` |
| 8 Seasons and work | `wordtype-us-ukse` (vastaus: vastaukse-), `wordtype-uus-ude` (vapaus: vapaude-), `wordtype-as` (rikas: rikkaa-), `wordtype-is` (kaunis: kaunii-), `wordtype-in` (avain: avaime-), `gradation-k-drops` (ruoka: ruoan), `imperative-sg` (mood), `imperative-pl` (mood), `minen-noun` (construction), `rektio-puhua-sta`, `rektio-tutustua-hin`, `rektio-soittaa-lle`, `rektio-kysya-lta`, `rektio-nayttaa-lta`, `rektio-maistua-lta`, `rektio-tuntua-lta`, `rektio-kuulostaa-lta` |
| 9 Celebrations | `t-plural` (case), `passive-present` (tense), `passive-negative` (tense), `passive-uses` (sentence: three uses), `verb-plus-infinitive` (construction), `rektio-haluta-inf`, `rektio-osata-inf`, `rektio-voida-inf`, `rektio-aikoa-inf` |
| 10 My past | `imperfekti-form` (tense), `imperfekti-type-1-a-oi` (tense: auttaa: auttoi), `imperfekti-si` (tense: tietää: tiesi), `imperfekti-types-2-6` (tense), `gradation-imperfekti` (gradation), `rektio-muistaa-inf`, `rektio-unohtaa-inf`, `rektio-tottua-hin`, `rektio-rakastua-hin`, `rektio-luottaa-hin` |
| 11 Housing problems | `imperfekti-negative` (tense: en tehnyt), `nut-participle-form` (construction), `rektio-vastata-hin`, `rektio-kertoa-lle`, `rektio-antaa-lle` |
| 12 Neighbours and rules | `postpositions-genitive` (case: talon takana), `postpositions-partitive` (case: ennen, ilman), `object-total-vs-partitive` (object), `object-negative` (object), `necessity-taytyy` (sentence: minun täytyy), `necessity-pitaa` (sentence), `necessity-on-pakko` (sentence), `necessity-negative` (sentence: ei tarvitse) |

## Section 3: Everyday

| Unit | Rules to add |
|---|---|
| 13 Errands | `object-imperative` (object: osta kirja), `object-necessity` (object: minun täytyy ostaa kirja), `object-plural` (object), `feeling-verbs` (sentence: minua väsyttää), `rektio-pelata-part`, `rektio-kiittaa-sta`, `rektio-huolehtia-sta`, `relative-joka` (construction), `relative-joka-cases` (construction: jonka, jota, jossa) |
| 14 Health | `conjunctions-coordinating` (sentence), `conjunctions-subordinating` (sentence: koska, vaikka, jos, kun, että), `plural-stem` (case), `plural-local-cases` (case), `rektio-karsia-sta`, `rektio-toipua-sta` |
| 15 Parties and jobs | `plural-partitive-form` (case), `plural-partitive-kissa-koira` (wordtype: -oja or -ia), `plural-partitive-use` (object), `plural-genitive-form` (case), `plural-genitive-use` (case), `wordtype-ton` (työtön: työttömä-), `wordtype-lainen` (case) |
| 16 Nature and summer | `predicative-nominative` (sentence), `predicative-partitive` (sentence), `rektio-saada-inf`, `rektio-jaksaa-inf`, `ma-infinitive-maan` (construction), `ma-infinitive-massa` (construction), `ma-infinitive-masta` (construction), `rektio-menna-maan`, `rektio-jaada-maan`, `rektio-oppia-maan`, `rektio-olla-massa`, `rektio-lakata-masta`, `rektio-auttaa-maan` (object + -maan) |
| 17 Job hunting | `perfekti-form` (tense), `perfekti-negative` (tense), `perfekti-vs-imperfekti` (tense), `numbers-in-cases` (case), `ordinals-in-cases` (case), `rektio-paattaa-inf`, `rektio-luvata-inf`, `rektio-hakea-part` |

## Section 4: Upper

| Unit | Rules to add |
|---|---|
| 18 Housing and opinions | `comparative` (case), `superlative` (case), `comparative-partitive` (case: minua vanhempi), `adjective-ton` (wordtype), `adjective-llinen` (wordtype), `conditional-form` (mood), `conditional-use` (mood: polite and hypothetical), `adverb-sti` (construction), `rektio-kiinnostunut-sta`, `rektio-ylpea-sta`, `rektio-iloinen-sta`, `rektio-tyytyvainen-hin`, `rektio-ihastunut-hin`, `rektio-vihainen-lle`, `rektio-kiitollinen-lle`, `rektio-allerginen-lle`, `rektio-hyva-ssa`, `rektio-valmis-maan` |
| 19 Work and study | `essive-use` (case), `translative-use` (case), `rektio-tulla-ksi`, `rektio-muuttua-ksi`, `rektio-valmistua-ksi`, `rektio-toimia-na`, `rektio-tyoskennella-na`, `result-sentence` (sentence: hänestä tuli lääkäri), `pluskvamperfekti` (tense), `transitive-intransitive` (verbtype: avata and avautua) |
| 20 Complaints | `conditional-perfect` (mood), `conditional-perfect-negative` (mood), `rektio-valittaa-sta`, `rektio-pettya-hin`, `rektio-suuttua-lle` |
| 21 History and idioms | `passive-imperfekti` (tense), `passive-perfekti` (tense), `passive-negative-past` (tense), `time-span-sta-hin` (case: from when until when) |
| 22 Storytelling | `participle-va` (construction), `participle-nut` (construction), `participle-tava` (construction), `participle-tu` (construction), `clause-equivalents-intro` (construction) |

## Section 5: Advanced

| Unit | Rules to add |
|---|---|
| 23 In the news | `participle-va-attribute`, `participle-nut-attribute`, `participle-tava-attribute`, `participle-tu-attribute` (all construction), `on-mentava` (sentence: necessity with a participle) |
| 24 Who did it | `agent-participle-form` (construction), `agent-participle-cases` (construction) |
| 25 They say that | `referative-present` (construction: sanoo tulevansa), `referative-past` (construction: sanoo tulleensa), `referative-other-subject` (construction) |
| 26 While and after | `temporal-essa` (construction: tullessaan), `temporal-tua` (construction: tultuaan), `modal-en` (construction: second infinitive, tehden) |
| 27 In order to | `final-kseen` (construction: tehdäkseen), `ma-infinitive-malla` (construction: by doing), `ma-infinitive-matta` (construction: without doing), `minen-rections` (rektio: fourth infinitive) |
| 28 Probably | `potential-form` (mood), `potential-lienee` (mood), `potential-passive` (mood) |
| 29 Without and with | `abessive` (case), `comitative` (case), `instructive` (case), `prolative` (case: postitse), `reduplication` (construction: vuosi vuodelta) |
| 30 Verbs and their cases | `rektio-kysymys-sta`, `rektio-tieto-sta`, `rektio-vastuu-sta`, `rektio-ratkaisu-hin`, `rektio-vastaus-hin`, `rektio-kiinnostus-hin`, `rektio-etta-siita` (siitä, että), `rektio-etta-siihen` (siihen, että), `object-total-verbs` (object: verbs that take a total object), `object-ongoing-vs-done` (object), `object-accusative-pronouns` (object: minut, sinut) |
| 31 How people really talk | `clitic-han`, `clitic-kin-kaan`, `clitic-pa` (all clitic), `spoken-pronouns` (phonology: mä, sä), `spoken-verbs` (verbtype: me mennään, ne menee), `spoken-passive-we` (tense), `derivation-ja` (wordtype: opettaja), `derivation-us` (wordtype: opetus), `derivation-verbs` (verbtype: causative and reflexive) |

## Totals

About 230 planned rules, of which about 75 are `rektio`. At 4 exercises minimum per
rule that is about 920 tagged exercises, inside the 1,900 planned.

## Reference pages by topic

| Topic | Page |
|---|---|
| Whole index | https://uusikielemme.fi/finnish-grammar |
| Verb types | https://uusikielemme.fi/finish-grammar/the-finnish-verbtypes/ |
| Location case rections | https://uusikielemme.fi/finnish-grammar/verb-rections-rektiot-verbit/ |
| Partitive verbs | https://uusikielemme.fi/finnish-grammar/partitive-verbs-partitiiviverbit-list/ |
| Person rections (kenelle, keneltä, kenestä, keneen) | https://uusikielemme.fi/finnish-grammar/syntax/rections/finnish-rections-kenelta-kenesta-keneen/ |
| First infinitive rections | https://uusikielemme.fi/finnish-grammar/syntax/rections/infinitive-verb-rections-rektiot-perusmuoto |
| Third infinitive rections | https://uusikielemme.fi/finnish-grammar/third-infinitive-rections-kolmas-infinitiivi/ |
| Adjective rections | https://uusikielemme.fi/finnish-grammar/syntax/rections/adjective-rections-vihainen-sinulle-ylpea-sinusta/ |
| Noun rections | https://uusikielemme.fi/finnish-grammar/syntax/rections/noun-rections-noun-noun |
| Total object verbs | https://uusikielemme.fi/finnish-grammar/syntax/object-sentences/total-object-verbs-genitive-object-verb-list |
| Noun inflection index | https://uusikielemme.fi/inflection-of-nouns-finnish-grammar |
| Verb conjugation index | https://uusikielemme.fi/conjugation-of-verbs-finnish-grammar |
| Syntax index | https://uusikielemme.fi/finnish-syntax-finnish-grammar |
| Derivation index | https://uusikielemme.fi/derivation |

## Open points

- The rections in this map were assigned by me from the site's lists and my own
  knowledge of Finnish. Each one is confirmed against the dictionary when its unit
  is written, and a wrong one fails only if its example uses the wrong case.
- Not yet read on the site: translative verb rections, perceptional verbs, fourth
  infinitive rections, rections with että, the single case and tense articles.
