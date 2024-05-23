const steps = {
  card: "payment-card-number",
  exp: "expiration-date",
  postal: "postal-code",
  sec: "security-code",
};

module.exports = {
  en: {
    voice: "Polly.Ruth-Neural",
    language: "en-US",
    script: {
      [steps.card]:
        "Welcome to our secure payment system. Please enter your sixteen digit payment card number, followed by the pound key.",
      [steps.exp]:
        "Thank you. Now, please enter the expiration date of your card. Enter the two-digit month, followed by the two-digit year",
      [steps.sec]:
        "Please enter the three-digit security code found on the back of your card, followed by the pound key.",
      [steps.postal]:
        "Finally, enter the postal code associated to your billing address.",
    },
  },
  es: {
    voice: "Polly.Sergio-Neural",
    language: "es-ES",
    script: {
      [steps.card]:
        "Bienvenido a nuestro sistema de pago seguro. Por favor, ingrese su número de tarjeta de pago de dieciséis dígitos, seguido de la tecla de numeral.",
      [steps.exp]:
        "Gracias. Ahora, por favor, ingrese la fecha de vencimiento de su tarjeta. Ingrese el mes de dos dígitos, seguido del año de dos dígitos.",
      [steps.sec]:
        "Por favor, ingrese el código de seguridad de tres dígitos que se encuentra en la parte posterior de su tarjeta, seguido de la tecla de numeral.",
      [steps.postal]:
        "Finalmente, ingrese el código postal asociado a su dirección de facturación.",
    },
  },
  fr: {
    voice: "Polly.Remi-Neural",
    language: "fr-FR",
    script: {
      [steps.card]:
        "Bienvenue dans notre système de paiement sécurisé. Veuillez entrer votre numéro de carte de paiement à seize chiffres, suivi de la touche dièse.",
      [steps.exp]:
        "Merci. Maintenant, veuillez entrer la date d'expiration de votre carte. Entrez le mois à deux chiffres, suivi de l'année à deux chiffres.",
      [steps.sec]:
        "Veuillez entrer le code de sécurité à trois chiffres qui se trouve au dos de votre carte, suivi de la touche dièse.",
      [steps.postal]:
        "Enfin, entrez le code postal associé à votre adresse de facturation.",
    },
  },
  de: {
    voice: "Polly.Vicki-Neural",
    language: "de-DE",
    script: {
      [steps.card]:
        "Willkommen in unserem sicheren Zahlungssystem. Bitte geben Sie Ihre sechzehnstellige Kartennummer ein und drücken Sie die Rautetaste.",
      [steps.exp]:
        "Vielen Dank. Bitte geben Sie jetzt das Ablaufdatum Ihrer Karte ein. Geben Sie den zweistelligen Monat gefolgt von dem zweistelligen Jahr ein.",
      [steps.sec]:
        "Bitte geben Sie den dreistelligen Sicherheitscode auf der Rückseite Ihrer Karte ein und drücken Sie die Rautetaste.",
      [steps.postal]:
        "Zum Schluss geben Sie bitte die Postleitzahl ein, die mit Ihrer Rechnungsadresse verknüpft ist.",
    },
  },
  it: {
    voice: "Polly.Adriano-Neural",
    language: "it-IT",
    script: {
      [steps.card]:
        "Benvenuto nel nostro sistema di pagamento sicuro. Si prega di inserire il numero della carta di pagamento di sedici cifre, seguito dal tasto cancelletto.",
      [steps.exp]:
        "Grazie. Ora, si prega di inserire la data di scadenza della carta. Inserire il mese di due cifre, seguito dall'anno di due cifre.",
      [steps.sec]:
        "Si prega di inserire il codice di sicurezza a tre cifre che si trova sul retro della carta, seguito dal tasto cancelletto.",
      [steps.postal]:
        "Infine, inserire il codice postale associato all'indirizzo di fatturazione.",
    },
  },
  jp: {
    voice: "Polly.Kazuha-Neural",
    language: "ja-JP",
    script: {
      [steps.card]:
        "安全な決済システムへようこそ。十六桁のクレジットカード番号を入力し、シャープキーを押してください。",
      [steps.exp]:
        "ありがとうございます。次に、カードの有効期限を入力してください。2桁の月と2桁の年を続けて入力してください。",
      [steps.sec]:
        "カードの裏面にある3桁のセキュリティコードを入力し、シャープキーを押してください。",
      [steps.postal]: "最後に、請求先住所の郵便番号を入力してください。",
    },
  },
  kr: {
    voice: "Polly.Seoyeon-Neural",
    language: "ko-KR",
    script: {
      [steps.card]:
        "안전한 결제 시스템에 오신 것을 환영합니다. 열 여섯 자리 카드 번호를 입력한 후 샤프 키를 눌러주세요.",
      [steps.exp]:
        "감사합니다. 이제 카드의 유효 기간을 입력해주세요. 두 자리의 월과 두 자리의 연도를 순서대로 입력해주세요.",
      [steps.sec]:
        "카드 뒷면에 있는 3자리 보안 코드를 입력한 후 샤프 키를 눌러주세요.",
      [steps.postal]:
        "마지막으로, 청구서 주소와 연관된 우편번호를 입력해주세요.",
    },
  },
  pt: {
    voice: "Polly.Ines-Neural",
    language: "pt-PT",
    script: {
      [steps.card]:
        "Bem-vindo ao nosso sistema de pagamento seguro. Por favor, insira o número de dezesseis dígitos do seu cartão de pagamento, seguido da tecla jogo da velha.",
      [steps.exp]:
        "Obrigado. Agora, por favor, insira a data de validade do seu cartão. Digite o mês de dois dígitos, seguido do ano de dois dígitos.",
      [steps.sec]:
        "Por favor, insira o código de segurança de três dígitos encontrado na parte de trás do seu cartão, seguido da tecla jogo da velha.",
      [steps.postal]:
        "Finalmente, insira o código postal associado ao seu endereço de cobrança.",
    },
  },
};
