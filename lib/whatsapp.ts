export function genererLienWhatsApp(data: {
  reservation: any
  client: any
  vehicule: any
  calcul: any
}): string {
  const { reservation, client, vehicule, calcul } = data

  const statutEmoji = reservation.montant_paye === 0
    ? '🟡 PRÉ-RÉSERVÉ (date encore disponible)'
    : '🔵 EN ATTENTE DE VALIDATION'

  const condChauf = reservation.avec_chauffeur
    ? `\n🍽️  Repas chauffeur    : À charge du client ✅\n🏨  Hébergement chauf  : À charge du client ✅`
    : ''

  const upgradeInfo = reservation.upgrade_24h
    ? `\n⚠️ *Upgrade 24H :* ${reservation.motif_upgrade}` : ''

  const option24hText = reservation.type_demande === '24H'
    ? `\n• Option 24H : ${reservation.option_24h === 'MATIN' ? '🌅 Matin (07h→06h)' : '🌆 Soir (19h→18h)'}`
    : ''

  const message = `
🚗 *NOUVELLE DEMANDE — Location Voiture Madagascar*
_Avec ou Sans Chauffeur_
━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 *Référence :* ${reservation.id}
📅 *Soumis le :* ${new Date().toLocaleDateString('fr-FR')}
${statutEmoji}

👤 *CLIENT*
• Nom : ${client.nom} ${client.prenom || ''}
• Tél : ${client.contact || 'Non renseigné'}
• Email : ${client.email || 'Non renseigné'}
• Adresse : ${client.adresse || 'Non renseignée'}
• CIN/Permis : ${client.cin_permis || 'Non renseigné'}

🗺️ *TRAJET*
• 📍 Départ : ${reservation.depart}
• 🏁 Destination : ${reservation.destination}

🚘 *VÉHICULE & RÉSERVATION*
• Voiture : ${vehicule.nom}
• Option : ${reservation.avec_chauffeur ? '👤 Avec chauffeur' : '🚗 Sans chauffeur'}
• Du : ${reservation.date_debut} au ${reservation.date_fin}
• Durée : *${reservation.duree} jour(s)*
• Type demandé : ${reservation.type_demande}
• Type appliqué : *${reservation.type_applique}*
• Départ : ${reservation.heure_debut || 'N/A'}
• Retour : ${reservation.heure_fin || 'N/A'}${option24hText}${upgradeInfo}

💰 *TARIFICATION*
• Calcul : ${calcul.detail}
• Prix base : ${calcul.prixBase.toLocaleString()} Ar
• Remise : -${(reservation.remise || 0).toLocaleString()} Ar
• *Total : ${calcul.total.toLocaleString()} Ar*
• Acompte : ${reservation.montant_paye.toLocaleString()} Ar
• Reste : ${reservation.reste.toLocaleString()} Ar

📋 *CONDITIONS ACCEPTÉES*
⛽ Carburant : À charge du client ✅${condChauf}

━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ *Validation requise dans l'espace admin*
  `.trim()

  const numero = process.env.NEXT_PUBLIC_WA_NUMBER || '+261349120726'
  return `https://wa.me/${numero}?text=${encodeURIComponent(message)}`
}
