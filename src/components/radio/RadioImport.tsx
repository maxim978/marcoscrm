'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Upload, Loader2, FileText } from 'lucide-react'
import { importRadioData } from '@/app/actions/radio'
import { Textarea } from '@/components/ui/textarea'

export function RadioImport() {
  const [isOpen, setIsOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [text, setText] = useState(`1. Radio 538
Bekende DJ’s / shows:
Frank Dane
Wietze de Jager
Klaas van der Eerden
Dennis Ruyer
Edwin Evers
Timur Perlin
Jelte van der Goot
Barry Paf
Coen Swijnenberg
Sander Lantinga
Bas Menting
Jordi Warners
Housuh in de Pauzuh
Martijn Biemans
Ivo van Breukelen

2. Qmusic
Bekende DJ’s / shows:
Mattie Valk
Marieke Elsinga
Domien Verschuuren
Kai Merckx
Menno Barreveld
Joost Swinkels
Bram Krikke
Tom van der Weerd
Anne de Jong
Hila Noorzai
Vincent Fierens
Wim van Helden
Stephan Bouwman
Igmar Felicia
Jasper de Vries

3. NPO Radio 2
Bekende DJ’s / shows:
Ruud de Wild
Jan-Willem Roodbeen
Jeroen Kijk in de Vegte
Annemieke Schollaardt
Gijs Staverman
Leo Blokhuis
Emmely de Wilt
Bart Arens
Carolien Borgers
Wouter van der Goes
Frank van ’t Hof
Stefan Stasse
Paul Rabbering
Timur Perlin
Morad El Ouakili

4. Sky Radio
Bekende DJ’s / shows:
Tanneke
Wilfred Genee
Jos van Heerden
Daniel Lippens
Sandra Schuurhof
Bas van Veenendaal
Tonny Eyk

5. Radio 10
Bekende DJ’s / shows:
Gerard Ekdom
Rob van Someren
Lex Gaarthuis
Jeroen Nieuwenhuize
Edwin Diergaarde
Silvan Stoet
Dennis Verheugd
Ferry Maat
Tim Klijn
Cobus Bosscha
Sander de Heer
Robert Feller
Rene Verkerk

6. NPO Radio 1
Bekende presentatoren:
Sven Kockelmann
Wilfred Genee
Fidan Ekiz
Jurgen van den Berg
Humberto Tan
Astrid Kersseboom
Ghislaine Plag
Sophie Hilbrand
Jort Kelder
Mischa Blok
Margje Fikse
Tijs van den Brink
Carrie ten Napel
Chris Kijne

7. Radio Veronica
Bekende DJ’s / shows:
Wouter van der Goes
Frank van ’t Hof
Gerard Ekdom
Rick van Velthuysen
Kees Baars
Dennis Hoebee
Bart Arens
Timur Perlin
Patrick Kicken
Erik de Zwart
Lex Harding

8. 100% NL
Bekende DJ’s / shows:
Giorgio Hokstam
Barry Paf
Koen Hansen
Lex Gaarthuis
Rob van Someren
Martijn La Grouw
Colin Banks
Olivier Bakker
Ingrid Jansen

9. SLAM!
Bekende DJ’s / shows:
Housuh in de Pauzuh
Daniël Lippens
Bram Krikke
Tom & Bram
Giorgio Hokstam
Joey van der Velden
Lucas & Steve
MixMarathon DJ’s
Robin Bright
Jesper de Jong

10. NPO 3FM
Bekende DJ’s / shows:
Barend van Deelen
Wijnand Speelman
Sophie Hijlkema
Sander Hoogendoorn
Timur Perlin
Vera Siemons
Eva Koreman
Jorien Renkema
Menno de Boer
Justin Verkijk
Fernando Halman
Nellie Benner

11. Sublime
Bekende DJ’s / shows:
Jaap Brienen
Fernando Halman
Erik de Zwart
Shay Kreuger
Jaimy de Ruijter
Roland Snoeijer
Kees de Koning

12. KINK
Bekende DJ’s / shows:
Michiel Veenstra
Eric Corton
Stefan Koren
Tim Op het Broek
Sander Hoogendoorn
Isabelle Brinkman
Marcel Kever
Bart Arens

13. JOE Nederland
Bekende DJ’s / shows:
Coen Swijnenberg
Sander Lantinga
Kai Merckx
Toine van Peperstraten
Jeroen Kijk in de Vegte
Tessa van Tol
Arjan Snijders

14. NPO Radio 5
Bekende DJ’s / shows:
Bert Haandrikman
Angela Groothuizen
Hans Schiffers
Hijlco Span
Henkjan Smits
Jan Rietman
Daniël Dekker
Petra de Joode
Simone Walraven
Astrid de Jong

15. FunX
Bekende DJ’s / shows:
Fernando Halman
Morad El Ouakili
Shay Kreuger
Nora Akachar
Quincy Wilson
Youssef Amrani
Gillyonair
Défano Holwijn
Jasper de Vries

16. NPO Sterren NL
Bekende DJ’s / shows:
Daniël Dekker
Jan Paparazzi
Hessel Westra
Corné Klijn
Leonie Sazias
Emmely de Wilt

17. Veronica Rock Radio
Bekende DJ’s / shows:
Kees Baars
Tim Op het Broek
Rob Stenders
Michiel Veenstra

18. Classicnl
Bekende presentatoren:
Sander Zwiep
Clairy Polak
Ab Nieuwdorp
Hans van den Boom
Margriet Vroomans

19. BNR Nieuwsradio
Bekende presentatoren:
Thomas van Zijl
Bas van Werven
Iwan Verrips
Liesbeth Staats
Kees Dorresteijn
Art Rooijakkers
Diana Matroos
Roelof Hemmen
Sjors Fröhlich

20. Omroep Brabant Radio
Bekende DJ’s / presentatoren:
Jordy Graat
Kristian Westerveld
Ronny Balk
Erik van der Ven
René van den Abeelen
Willem-Jan Joachems
Nicole van den Hurk

21. RADIONL
Bekende DJ’s / presentatoren:
René Karst
Hessel Westra
Marcel de Vries
Jan van Veen
Robin Bakker
Willem de Wijs
Marcel van der Veen

22. Sterren NL Radio
Bekende DJ’s / presentatoren:
Daniël Dekker
Corné Klijn
Emmely de Wilt
Jan Paparazzi
Leonie Sazias
Hessel Westra

23. Tukker FM
Bekende DJ’s / presentatoren:
Gerard Palts
Jeroen Mulder
Henk Wijngaard specials
Regionale feest-DJ’s
Piratenmuziek hosts

24. Radio Continu
Bekende DJ’s / presentatoren:
Marcel de Groot
René Becker
Jan de Hoop
Henk Dissel specials
Feestavond presentatoren

25. Hollandse Hits Radio
Bekende DJ’s / presentatoren:
Jeffrey Schenk
Frans Duijts specials
Feest DJ Willem
Jan Biggel specials
Nederlandse artiestenshows

26. Puur NL
Bekende DJ’s / presentatoren:
Willem de Wijs
Jan van Veen
Johan Kettenburg
René van der Gijp specials
Regionale artiestenhosts

27. Oranje Radio
Bekende DJ’s / presentatoren:
Danny Panadero
Frank van Etten specials
René Schuurmans specials
Kroegenparade hosts

28. Hitzzz!! Nederlandstalig
Bekende DJ’s / presentatoren:
Feest DJ Maarten
Nederlandstalige hitshows
Piratenmuziek hosts
Regionale artiestenprogramma’s

29. RadioNL Fryslân
Bekende DJ’s / presentatoren:
Friese muziekhosts
Nederlandstalige artiestenshows
Regionale feest-DJ’s

30. Achterhoek FM / Piratenstations
Bekende DJ’s / presentatoren:
Regionale piraten-DJ’s
Nederlandstalige verzoekshows
Feestmuziekpresentatoren
Polka & schlager hosts`)
  const [error, setError] = useState<string | null>(null)

  const handleImport = async () => {
    if (!text.trim()) return

    setIsImporting(true)
    setError(null)

    try {
      const res = await importRadioData(text)
      if (res.error) {
        setError(res.error)
      } else {
        setIsOpen(false)
        setText('')
        alert('Radio data succesvol geïmporteerd!')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-11 font-bold border-slate-200">
          <FileText className="mr-2 h-4 w-4 text-orange-500" />
          Importeer Radio Lijst
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Radio Stations Importeren</DialogTitle>
          <DialogDescription className="font-medium text-slate-500">
            Plak hier de lijst met radiostations en DJ's in het formaat: **1. Station Naam**, gevolgd door de namen van de DJ's.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea 
            placeholder="1. Radio 538&#10;Bekende DJ's / shows:&#10;Frank Dane&#10;Wietze de Jager&#10;...&#10;2. Qmusic&#10;..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="h-[400px] rounded-xl font-mono text-xs p-4 bg-slate-50 border-slate-200 resize-none"
            disabled={isImporting}
          />
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <Button 
            onClick={handleImport} 
            disabled={isImporting || !text.trim()} 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black h-12 rounded-xl shadow-lg shadow-orange-500/20"
          >
            {isImporting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Upload className="h-5 w-5 mr-2" />}
            Start Import
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
