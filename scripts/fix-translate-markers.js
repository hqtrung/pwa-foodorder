#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Translation mappings
const translations = {
  fr: {
    ' Customer Information': 'Informations client',
    ' Delivery Address': 'Adresse de livraison',
    ' Delivery': 'Livraison',
    ' Your order will be delivered within 30-45 minutes. We\'ll contact you if there are any changes.': 'Votre commande sera livrée dans 30-45 minutes. Nous vous contacterons en cas de changement.',
    ' Delivery Time': 'Temps de livraison',
    ' Delivery Information': 'Informations de livraison',
    ' Please enter customer name': 'Veuillez saisir le nom du client',
    ' Please fill in all delivery information': 'Veuillez remplir toutes les informations de livraison',
    ' Please select a payment method': 'Veuillez sélectionner un mode de paiement',
    ' Unable to place order. Please try again.': 'Impossible de passer la commande. Veuillez réessayer.',
    ' Delivery address is required': 'L\'adresse de livraison est requise',
    ' Customer name is required': 'Le nom du client est requis',
    ' Maximum retry attempts exceeded': 'Nombre maximum de tentatives dépassé',
    ' Phone number is required for delivery': 'Le numéro de téléphone est requis pour la livraison',
    ' An unexpected error occurred': 'Une erreur inattendue s\'est produite',
    ' Please provide accurate address for timely delivery': 'Veuillez fournir une adresse précise pour une livraison rapide',
    ' House number, street, ward, district, city': 'Numéro, rue, quartier, arrondissement, ville',
    ' Customer Name': 'Nom du client',
    ' Enter your name': 'Saisissez votre nom',
    ' Delivery Instructions': 'Instructions de livraison',
    ' Help the delivery person find your address easily': 'Aidez le livreur à trouver facilement votre adresse',
    ' e.g., 3rd floor, room 301, blue door bell': 'ex: 3ème étage, appartement 301, sonnette bleue',
    ' Email': 'Email',
    ' To receive order notifications (optional)': 'Pour recevoir les notifications de commande (optionnel)',
    ' email@example.com': 'email@exemple.com',
    ' Phone Number': 'Numéro de téléphone',
    ' For the restaurant to contact you if needed': 'Pour que le restaurant puisse vous contacter si nécessaire',
    ' 0xxx xxx xxx': '0xxx xxx xxx',
    ' Table': 'Table',
    ' Next': 'Suivant',
    ' Place Order': 'Passer la commande',
    ' Previous': 'Précédent',
    ' Processing...': 'Traitement en cours...',
    ' Change': 'Modifier',
    ' Table {number}': 'Table {number}',
    ' Order Information': 'Informations de commande',
    ' Payment Method': 'Mode de paiement',
    ' Order Summary': 'Récapitulatif de commande',
    ' Table Information': 'Informations de table',
    ' Special requests will be forwarded to the kitchen': 'Les demandes spéciales seront transmises à la cuisine',
    ' Add notes for your order (e.g., no spicy, less sugar...)': 'Ajoutez des notes pour votre commande (ex: pas épicé, moins de sucre...)',
    ' Special Instructions': 'Instructions spéciales',
    ' Step {current} of {total}': 'Étape {current} sur {total}',
    ' Review Order': 'Vérifier la commande',
    ' Order placed successfully! Order ID: {orderId}': 'Commande passée avec succès ! ID de commande : {orderId}',
    ' Please remain at your table to receive your order. Our staff will bring your food directly to you.': 'Veuillez rester à votre table pour recevoir votre commande. Notre personnel vous apportera votre repas directement.',
    ' Important Notice': 'Avis important'
  },
  it: {
    ' Hide Details': 'Nascondi dettagli',
    ' Show Details': 'Mostra dettagli',
    ' Review Items': 'Rivedi articoli',
    ' Order Details': 'Dettagli ordine',
    ' Step {current} of {total}': 'Passo {current} di {total}',
    ' Table Information': 'Informazioni tavolo',
    ' Delivery Information': 'Informazioni consegna',
    ' Payment Method': 'Metodo di pagamento',
    ' Review Order': 'Rivedi ordine',
    ' Important Notice': 'Avviso importante',
    ' Please remain at your table to receive your order. Our staff will bring your food directly to you.': 'Si prega di rimanere al proprio tavolo per ricevere l\'ordine. Il nostro staff vi porterà il cibo direttamente.',
    ' Table {number}': 'Tavolo {number}',
    ' Delivery': 'Consegna',
    ' Delivery Time': 'Tempo di consegna',
    ' Your order will be delivered within 30-45 minutes. We\'ll contact you if there are any changes.': 'Il vostro ordine sarà consegnato entro 30-45 minuti. Vi contatteremo in caso di modifiche.',
    ' Customer Information': 'Informazioni cliente',
    ' Delivery Address': 'Indirizzo di consegna',
    ' Special Instructions': 'Istruzioni speciali',
    ' Add notes for your order (e.g., no spicy, less sugar...)': 'Aggiungi note per il tuo ordine (es: non piccante, meno zucchero...)',
    ' Special requests will be forwarded to the kitchen': 'Le richieste speciali saranno inoltrate alla cucina',
    ' Customer Name': 'Nome cliente',
    ' Enter your name': 'Inserisci il tuo nome',
    ' Phone Number': 'Numero di telefono',
    ' 0xxx xxx xxx': '0xxx xxx xxx',
    ' For the restaurant to contact you if needed': 'Per permettere al ristorante di contattarti se necessario',
    ' Email': 'Email',
    ' email@example.com': 'email@esempio.com',
    ' To receive order notifications (optional)': 'Per ricevere notifiche dell\'ordine (opzionale)',
    ' Delivery Address': 'Indirizzo di consegna',
    ' House number, street, ward, district, city': 'Numero civico, via, quartiere, distretto, città',
    ' Please provide accurate address for timely delivery': 'Si prega di fornire un indirizzo preciso per una consegna puntuale',
    ' Delivery Instructions': 'Istruzioni di consegna',
    ' e.g., 3rd floor, room 301, blue door bell': 'es: 3° piano, appartamento 301, campanello blu',
    ' Help the delivery person find your address easily': 'Aiuta il fattorino a trovare facilmente il tuo indirizzo',
    ' Table': 'Tavolo',
    ' Previous': 'Precedente',
    ' Next': 'Successivo',
    ' Place Order': 'Ordina',
    ' Processing...': 'Elaborazione...',
    ' Order Information': 'Informazioni ordine',
    ' Change': 'Cambia',
    ' Order Summary': 'Riepilogo ordine',
    ' Name must be at least 2 characters': 'Il nome deve essere di almeno 2 caratteri',
    ' Please enter a valid phone number': 'Inserisci un numero di telefono valido',
    ' Please enter a valid email address': 'Inserisci un indirizzo email valido',
    ' Please enter customer name': 'Inserisci il nome del cliente',
    ' Please fill in all delivery information': 'Compila tutte le informazioni di consegna',
    ' Please select a payment method': 'Seleziona un metodo di pagamento',
    ' Unable to place order. Please try again.': 'Impossibile effettuare l\'ordine. Riprova.',
    ' Customer name is required': 'Il nome del cliente è richiesto',
    ' Phone number is required for delivery': 'Il numero di telefono è richiesto per la consegna',
    ' Delivery address is required': 'L\'indirizzo di consegna è richiesto',
    ' An unexpected error occurred': 'Si è verificato un errore imprevisto',
    ' Maximum retry attempts exceeded': 'Numero massimo di tentativi superato',
    ' Order placed successfully! Order ID: {orderId}': 'Ordine effettuato con successo! ID ordine: {orderId}'
  },
  ja: {
    ' Hide Details': '詳細を非表示',
    ' Order Details': '注文詳細',
    ' Track Order': '注文追跡',
    ' View Details': '詳細を表示',
    ' Show QR Code': 'QRコードを表示',
    ' Live updates': 'リアルタイム更新',
    ' Manual refresh': '手動更新',
    ' Step {current} of {total}': 'ステップ {current}/{total}',
    ' Table Information': 'テーブル情報',
    ' Delivery Information': '配送情報',
    ' Payment Method': '支払い方法',
    ' Review Order': '注文確認',
    ' Table {number}': 'テーブル {number}',
    ' Important Notice': '重要なお知らせ',
    ' Please remain at your table to receive your order. Our staff will bring your food directly to you.': 'ご注文をお受け取りいただくため、お席でお待ちください。スタッフが直接お料理をお持ちいたします。',
    ' Delivery': '配送',
    ' Delivery Time': '配送時間',
    ' Your order will be delivered within 30-45 minutes. We\'ll contact you if there are any changes.': 'ご注文は30-45分以内にお届けいたします。変更がある場合はご連絡いたします。',
    ' Customer Information': 'お客様情報',
    ' Delivery Address': '配送先住所',
    ' Special Instructions': '特別なご要望',
    ' Add notes for your order (e.g., no spicy, less sugar...)': 'ご注文へのメモを追加（例：辛くしない、砂糖少なめなど）',
    ' Special requests will be forwarded to the kitchen': '特別なご要望は厨房に伝えられます',
    ' Customer Name': 'お客様名',
    ' Enter your name': 'お名前を入力してください',
    ' Phone Number': '電話番号',
    ' 0xxx xxx xxx': '0xxx xxx xxx',
    ' For the restaurant to contact you if needed': '必要に応じてレストランからご連絡させていただくため',
    ' Email': 'メールアドレス',
    ' email@example.com': 'email@example.com',
    ' To receive order notifications (optional)': '注文通知を受け取るため（任意）',
    ' House number, street, ward, district, city': '番地、通り、区、市、都道府県',
    ' Please provide accurate address for timely delivery': '時間通りの配送のため正確な住所をご入力ください',
    ' Delivery Instructions': '配送指示',
    ' e.g., 3rd floor, room 301, blue door bell': '例：3階、301号室、青いインターホン',
    ' Help the delivery person find your address easily': '配達員が住所を見つけやすくするため',
    ' Table': 'テーブル',
    ' Previous': '前へ',
    ' Next': '次へ',
    ' Place Order': '注文する',
    ' Processing...': '処理中...',
    ' Order Information': '注文情報',
    ' Change': '変更',
    ' Order Summary': '注文概要',
    ' Name must be at least 2 characters': '名前は2文字以上で入力してください',
    ' Please enter a valid phone number': '有効な電話番号を入力してください',
    ' Please enter a valid email address': '有効なメールアドレスを入力してください',
    ' Please enter customer name': 'お客様名を入力してください',
    ' Please fill in all delivery information': '配送情報をすべて入力してください',
    ' Please select a payment method': '支払い方法を選択してください',
    ' Unable to place order. Please try again.': '注文できませんでした。もう一度お試しください。',
    ' Customer name is required': 'お客様名は必須です',
    ' Phone number is required for delivery': '配送には電話番号が必要です',
    ' Delivery address is required': '配送先住所は必須です',
    ' An unexpected error occurred': '予期しないエラーが発生しました',
    ' Maximum retry attempts exceeded': '最大再試行回数を超えました',
    ' Order placed successfully! Order ID: {orderId}': 'ご注文が完了しました！注文ID: {orderId}'
  },
  zh: {
    ' Hide Details': '隐藏详情',
    ' Show Details': '显示详情',
    ' Review Items': '查看商品',
    ' Order Details': '订单详情',
    ' Track Order': '订单跟踪',
    ' View Details': '查看详情',
    ' Customer Information': '客户信息',
    ' Delivery Address': '配送地址',
    ' Delivery': '配送',
    ' Delivery Time': '配送时间',
    ' Your order will be delivered within 30-45 minutes. We\'ll contact you if there are any changes.': '您的订单将在30-45分钟内送达。如有变更我们会联系您。',
    ' Delivery Information': '配送信息',
    ' Please enter customer name': '请输入客户姓名',
    ' Please fill in all delivery information': '请填写完整的配送信息',
    ' Please select a payment method': '请选择支付方式',
    ' Unable to place order. Please try again.': '下单失败，请重试。',
    ' Delivery address is required': '配送地址是必填的',
    ' Customer name is required': '客户姓名是必填的',
    ' Maximum retry attempts exceeded': '超过最大重试次数',
    ' Phone number is required for delivery': '配送需要手机号码',
    ' An unexpected error occurred': '发生了意外错误',
    ' Delivery Address': '配送地址',
    ' Please provide accurate address for timely delivery': '请提供准确地址以确保及时配送',
    ' House number, street, ward, district, city': '门牌号、街道、社区、区县、城市',
    ' Customer Name': '客户姓名',
    ' Enter your name': '请输入您的姓名',
    ' Delivery Instructions': '配送说明',
    ' Help the delivery person find your address easily': '帮助配送员更容易找到您的地址',
    ' e.g., 3rd floor, room 301, blue door bell': '例如：3楼，301室，蓝色门铃',
    ' Email': '邮箱',
    ' To receive order notifications (optional)': '接收订单通知（可选）',
    ' email@example.com': 'email@example.com',
    ' Phone Number': '电话号码',
    ' For the restaurant to contact you if needed': '以便餐厅必要时联系您',
    ' 0xxx xxx xxx': '0xxx xxx xxx',
    ' Table': '桌号',
    ' Next': '下一步',
    ' Place Order': '下单',
    ' Previous': '上一步',
    ' Processing...': '处理中...',
    ' Change': '修改',
    ' Table {number}': '桌号{number}',
    ' Order Information': '订单信息',
    ' Payment Method': '支付方式',
    ' complete': '完成',
    ' Customer Information': '客户信息',
    ' Delivery Information': '配送信息',
    ' Special Instructions': '特殊说明',
    ' sections complete': '部分完成',
    ' Checkout Progress': '结账进度',
    ' Delivery Information': '配送信息',
    ' Order Summary': '订单摘要',
    ' Table Information': '桌位信息',
    ' Special requests will be forwarded to the kitchen': '特殊要求将转达给厨房',
    ' Add notes for your order (e.g., no spicy, less sugar...)': '为您的订单添加备注（例如：不要辣、少糖...）',
    ' Special Instructions': '特殊说明',
    ' Step {current} of {total}': '第{current}步，共{total}步',
    ' Delivery Information': '配送信息',
    ' Payment Method': '支付方式',
    ' Review Order': '确认订单',
    ' Table Information': '桌位信息',
    ' Order placed successfully! Order ID: {orderId}': '下单成功！订单号：{orderId}',
    ' Please remain at your table to receive your order. Our staff will bring your food directly to you.': '请在您的桌子等候接收您的订单。我们的工作人员将直接为您送餐。',
    ' Important Notice': '重要提示',
    ' Table {number}': '桌号{number}',
    ' Table Information': '桌位信息',
    ' Name must be at least 2 characters': '姓名必须至少2个字符',
    ' Please enter a valid email address': '请输入有效的邮箱地址',
    ' Please enter a valid phone number': '请输入有效的电话号码'
  }
};

function fixTranslations(lang) {
  const filePath = path.join(process.cwd(), 'messages', `${lang}.json`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  const langTranslations = translations[lang];
  if (!langTranslations) {
    console.log(`❌ No translations defined for ${lang}`);
    return;
  }
  
  for (const [original, translated] of Object.entries(langTranslations)) {
    if (content.includes(original)) {
      content = content.replace(new RegExp(original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), translated);
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${lang.toUpperCase()}: Updated translations`);
  } else {
    console.log(`ℹ️  ${lang.toUpperCase()}: No changes needed`);
  }
}

// Fix all languages
console.log('🔄 Fixing translation markers...\n');

['fr', 'it', 'ja', 'zh'].forEach(lang => {
  fixTranslations(lang);
});

console.log('\n✅ All translation markers fixed!');