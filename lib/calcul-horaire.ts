import { TypeLocation, Option24H } from '@/types'

interface CreneauResult {
  typeApplique: TypeLocation
  upgrade24h: boolean
  motifUpgrade: string | null
  avertissement: string | null
  depassement: boolean
  formuleApres: boolean
}

function toMin(h: number, m: number = 0): number {
  return h * 60 + m
}

function parseH(str: string): { h: number; m: number } {
  const [h, m] = str.split(':').map(Number)
  return { h, m }
}

function validerJour(debut: string, fin: string): CreneauResult {
  const d = parseH(debut)
  const f = parseH(fin)
  const dMin = toMin(d.h, d.m)
  const fMin = toMin(f.h, f.m)

  if (dMin < toMin(6, 0)) {
    return {
      typeApplique: '24H', upgrade24h: true,
      motifUpgrade: `Départ à ${debut} — avant 06h00`,
      avertissement: `⚠️ Départ avant 06h00 : tarif 24H appliqué automatiquement.`,
      depassement: true, formuleApres: false
    }
  }
  if (fMin > toMin(19, 0)) {
    return {
      typeApplique: '24H', upgrade24h: true,
      motifUpgrade: `Retour à ${fin} — après 19h00`,
      avertissement: `⚠️ Retour après 19h00 : tarif 24H appliqué automatiquement.`,
      depassement: true, formuleApres: false
    }
  }
  return { typeApplique: 'JOUR', upgrade24h: false, motifUpgrade: null, avertissement: null, depassement: false, formuleApres: false }
}

function validerNuit(debut: string, fin: string): CreneauResult {
  const d = parseH(debut)
  const f = parseH(fin)
  const dMin = toMin(d.h, d.m)
  const fMin = toMin(f.h, f.m)

  if (dMin < toMin(19, 0)) {
    return {
      typeApplique: '24H', upgrade24h: true,
      motifUpgrade: `Départ à ${debut} — avant 19h00`,
      avertissement: `⚠️ Départ avant 19h00 : tarif 24H appliqué automatiquement.`,
      depassement: true, formuleApres: false
    }
  }
  if (fMin > toMin(6, 0) && fMin < toMin(19, 0)) {
    return {
      typeApplique: '24H', upgrade24h: true,
      motifUpgrade: `Retour à ${fin} — après 06h00`,
      avertissement: `⚠️ Retour après 06h00 : tarif 24H appliqué automatiquement.`,
      depassement: true, formuleApres: false
    }
  }
  return { typeApplique: 'NUIT', upgrade24h: false, motifUpgrade: null, avertissement: null, depassement: false, formuleApres: false }
}

function valider24H(fin: string, option: Option24H): CreneauResult {
  const f = parseH(fin)
  const fMin = toMin(f.h, f.m)

  if (option === 'MATIN' && fMin > toMin(6, 0) && fMin < toMin(19, 0)) {
    return {
      typeApplique: '24H', upgrade24h: false,
      motifUpgrade: `Dépassement 24H matin — retour à ${fin}`,
      avertissement: `⚠️ Retour après 06h00 sur option 24H matin. Majoration appliquée.`,
      depassement: true, formuleApres: true
    }
  }
  if (option === 'SOIR' && fMin > toMin(18, 0)) {
    return {
      typeApplique: '24H', upgrade24h: false,
      motifUpgrade: `Dépassement 24H soir — retour à ${fin}`,
      avertissement: `⚠️ Retour après 18h00 sur option 24H soir. Majoration appliquée.`,
      depassement: true, formuleApres: true
    }
  }
  return { typeApplique: '24H', upgrade24h: false, motifUpgrade: null, avertissement: null, depassement: false, formuleApres: false }
}

export function validerCreneau(
  type: TypeLocation,
  debut: string,
  fin: string,
  option24h?: Option24H
): CreneauResult {
  if (type === 'JOUR') return validerJour(debut, fin)
  if (type === 'NUIT') return validerNuit(debut, fin)
  if (type === '24H') return valider24H(fin, option24h ?? 'MATIN')
  return { typeApplique: '24H', upgrade24h: true, motifUpgrade: 'Type inconnu', avertissement: null, depassement: false, formuleApres: false }
}
    
