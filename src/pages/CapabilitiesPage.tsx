import capabilitiesMd from '../assets/capabilities.md?raw'

interface DocSection {
  title: string
  intro: string[]
  modules: DocModule[]
}

interface DocModule {
  title: string
  description: string
  bullets: string[]
}

interface ParsedCapabilities {
  docTitle: string
  docIntro: string[]
  sections: DocSection[]
}

function parseCapabilities(md: string): ParsedCapabilities {
  const lines: string[] = md.split('\n')
  const parsedSections: DocSection[] = []
  let currentSection: DocSection | null = null
  let currentModule: DocModule | null = null
  let titleStr = 'System Capabilities'
  const mainIntro: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    if (line.startsWith('# ')) {
      titleStr = line.substring(2).trim()
    } else if (line.startsWith('## ')) {
      const sectTitle = line.substring(3).trim()
      currentSection = {
        title: sectTitle,
        intro: [],
        modules: [],
      }
      parsedSections.push(currentSection)
      currentModule = null
    } else if (line.startsWith('### ')) {
      const modTitle = line.substring(4).trim()
      currentModule = {
        title: modTitle,
        description: '',
        bullets: [],
      }
      if (currentSection) {
        currentSection.modules.push(currentModule)
      }
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const bulletText = line.substring(2).trim()
      if (currentModule) {
        currentModule.bullets.push(bulletText)
      }
    } else if (line.startsWith('  - ') || line.startsWith('\t- ')) {
      const bulletText = line.trim().substring(2).trim()
      if (currentModule) {
        currentModule.bullets.push(bulletText)
      }
    } else {
      // Normal paragraph text
      if (currentModule) {
        currentModule.description = (currentModule.description + ' ' + line).trim()
      } else if (currentSection) {
        currentSection.intro.push(line)
      } else {
        mainIntro.push(line)
      }
    }
  }

  return {
    docTitle: titleStr,
    docIntro: mainIntro,
    sections: parsedSections,
  }
}

const parsedData = parseCapabilities(capabilitiesMd)

export function CapabilitiesPage() {
  const { docTitle, docIntro, sections } = parsedData


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-body">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        {/* Header */}
        <div className="space-y-4 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold uppercase tracking-wider">
            <span className="material-symbols-outlined text-xs">verified</span>
            System Contract
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            {docTitle || 'System Capabilities & Features'}
          </h1>
          {docIntro.map((paragraph, index) => (
            <p key={index} className="text-lg text-slate-400 max-w-3xl leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Sections */}
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-headline tracking-tight text-white border-s-4 border-teal-500 ps-4">
                {section.title}
              </h2>
              {section.intro.map((introText, iIdx) => (
                <p key={iIdx} className="text-slate-400 text-sm max-w-2xl">
                  {introText}
                </p>
              ))}
            </div>

            {/* Grid layout for modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {section.modules.map((mod, mIdx) => (
                <div
                  key={mIdx}
                  className="group relative bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800 hover:border-teal-500/40 rounded-2xl p-6 transition-all duration-300 backdrop-blur-sm shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-bold font-headline text-slate-100 group-hover:text-white transition-colors">
                        {mod.title}
                      </h3>
                      <div className="w-8 h-8 rounded-lg bg-slate-800/60 flex items-center justify-center text-slate-400 group-hover:text-teal-400 transition-colors">
                        <span className="material-symbols-outlined text-base">widgets</span>
                      </div>
                    </div>

                    {/* Description */}
                    {mod.description && (
                      <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                        {mod.description}
                      </p>
                    )}

                    {/* Bullet workflows */}
                    {mod.bullets.length > 0 && (
                      <ul className="space-y-2.5 pt-2 border-t border-slate-800/60">
                        {mod.bullets.map((bullet, bIdx) => {
                          // Parse **bold** parts in markdown
                          const parts = bullet.split('**')
                          return (
                            <li key={bIdx} className="text-xs text-slate-400 flex items-start gap-2">
                              <span className="material-symbols-outlined text-teal-500/80 text-xs mt-0.5 select-none">
                                check_circle
                              </span>
                              <span className="leading-normal">
                                {parts.map((part, pIdx) =>
                                  pIdx % 2 === 1 ? (
                                    <strong key={pIdx} className="text-slate-200 font-semibold">
                                      {part}
                                    </strong>
                                  ) : (
                                    part
                                  )
                                )}
                              </span>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
