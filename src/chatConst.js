export const playerMainOptions = [
  { id: "recharge", label: "Recharge", icon: "💰" },
  { id: "redeem", label: "Redeem", icon: "🎁" },
  { id: "wallet", label: "Wallet", icon: "👛" },
  { id: "giftcard", label: "Gift Cards", icon: "🎫" },
  { id: "support", label: "Help & Support", icon: "❓" },
  { id: "account", label: "Account Management", icon: "👤" },
  { id: "other", label: "Other", icon: "🤷‍♂️" },
];

export const playerSubOptions = {
  recharge: [
    { id: "recharge-methods", label: "Recharge Methods", icon: "💳" },
    { id: "recharge-amount", label: "Recharge Denominations", icon: "💵" },
    { id: "recharge-history", label: "Recharge History", icon: "📜" },
    { id: "recharge-notes", label: "Transaction Notes", icon: "📝" },
    { id: "recharge-issues", label: "Recharge Troubleshooting", icon: "⚠️" },
  ],
  redeem: [
    { id: "redeem-amount", label: "Redemption Amounts", icon: "💵" },
    { id: "redeem-fee", label: "Service Fees", icon: "💸" },
    { id: "redeem-time", label: "Processing Time", icon: "⏱️" },
    { id: "redeem-history", label: "Redemption History", icon: "📜" },
    { id: "redeem-notes", label: "Transaction Notes", icon: "📝" },
  ],
  wallet: [
    { id: "wallet-balance", label: "Check Balance", icon: "🔍" },
    { id: "wallet-cashout", label: "Cashout Process", icon: "💰" },
    { id: "wallet-history", label: "Transaction History", icon: "📜" },
    { id: "wallet-instant", label: "Instant Recharge", icon: "⚡" },
  ],
  giftcard: [
    { id: "giftcard-manage", label: "My Gift Cards", icon: "🎁" },
    { id: "giftcard-cashout", label: "Cashout to Gift Cards", icon: "💱" },
  ],
  support: [
    { id: "support-balance", label: "Balance Inquiries", icon: "💰" },
    { id: "support-giftcard", label: "Gift Card Issues", icon: "🎫" },
    { id: "support-transaction", label: "Transaction Issues", icon: "📜" },
  ],
  account: [
    { id: "account-login", label: "Login Issues", icon: "🔑" },
    { id: "account-profile", label: "Profile Menu", icon: "👤" },
  ],
};

export const playerFinalOptions = {
  "recharge-methods": [
    "What recharge methods are available on GETWAYS?",
    "How does Quick Debit Recharge work with Coinbase?",
    "What is the difference between Standard and Instant Recharge?",
    "Can I use my wallet funds for Instant Recharge?",
    "How does the payment portal work for recharges?",
  ],
  "recharge-amount": [
    "What denomination options are available for recharge?",
    "Can I recharge a custom amount?",
    "What are the minimum and maximum recharge amounts?",
  ],
  "recharge-history": [
    "How can I view my recent recharge transactions?",
    "How long does GETWAYS keep recharge history?",
    "Why is my recharge showing as pending?",
  ],
  "recharge-notes": [
    "How can I add a transaction note during recharge?",
    "What can transaction notes be used for?",
  ],
  "recharge-issues": [
    "My recharge payment was deducted but not credited",
    "How long does recharge processing normally take?",
    "Can I cancel a pending recharge?",
    "Why was my recharge attempt declined?",
  ],
  "redeem-amount": [
    "What denominations are available for redemption?",
    "Is there a minimum and maximum redeem amount?",
    "Can I redeem a custom amount?",
  ],
  "redeem-fee": [
    "What service fee applies to redemptions?",
    "How is the redemption service fee calculated?",
    "Are there any fee-free redeem options?",
    "Can the service fee change based on redemption amount?",
  ],
  "redeem-time": [
    "How long does the redemption process take?",
    "Why is my redemption taking longer than 2 hours?",
    "What causes redemption delays?",
  ],
  "redeem-history": [
    "Where can I see my redemption history?",
    "What does it mean if my redemption is marked as expired?",
    "Can I view the total number of redemption transactions?",
  ],
  "redeem-notes": [
    "How can I add a transaction note during redemption?",
    "What can transaction notes be used for in redemptions?",
  ],
  "wallet-balance": [
    "How to check my current wallet balance?",
    "Why is my balance not updating?",
    "Is there a maximum balance limit for my wallet?",
  ],
  "wallet-cashout": [
    "How does the cashout process work?",
    "What gift cards are available for cashout?",
    "What are the cashout amount restrictions?",
  ],
  "wallet-history": [
    "How can I view my complete wallet transaction history?",
    "What details are shown in the transaction history?",
  ],
  "wallet-instant": [
    "How to use wallet funds for Instant Recharge?",
    "Is there a limit to Instant Recharge amounts?",
    "Are there any fees for using Instant Recharge?",
    "Why can't I access the Instant Recharge option?",
  ],
  "giftcard-manage": [
    "How to view all my gift cards?",
    "How to see my expired gift cards?",
    "How can I find a specific gift card by order ID?",
  ],
  "giftcard-cashout": [
    "How to cashout my wallet balance to a gift card?",
    "Can I select multiple gift cards for a single cashout?",
  ],
  "support-balance": [
    "How do I check my available balance?",
    "What should I do if my balance is incorrect?",
  ],
  "support-giftcard": [
    "What should I do if my gift card is not working?",
    "How to check if a gift card is expired?",
    "Can I replace an expired gift card?",
  ],
  "support-transaction": [
    "How do I verify a transaction issue?",
    "What should I do if a transaction is pending for too long?",
    "Why did my transaction fail?",
  ],
  "account-login": ["Can I sign up directly on GETWAYS?"],
  "account-profile": [
    "What options are available in the profile dropdown?",
    "How do I change my account password?",
    "How do I access the help video ?",
  ],
};

export const playerFinalAnswers = {
  // Recharge Methods
  "What recharge methods are available on GETWAYS?":
    "On GETWAYS, there are three main recharge methods available: 1. **Quick Debit Recharge:** This method launches the Coinbase Onramp widget for quick USDC payment. 2. **Instant Recharge:** Allows users to instantly add funds to their wallet using various payment methods. 3. **Standard Recharge:** Offers traditional recharge options with multiple denominations to choose from. Feel free to ask if you need more details about any specific recharge method!",

  "How does Quick Debit Recharge work with Coinbase?":
    "Quick Debit Recharge on GETWAYS is a fast and secure payment method powered by Coinbase. When you select Quick Debit Recharge, you'll be redirected to the Coinbase-powered interface to complete your payment. The process is designed to be quick and seamless, allowing you to add funds to your wallet efficiently. If you have any more questions about Quick Debit Recharge or any other topic, feel free to ask!",

  "What is the difference between Standard and Instant Recharge?":
    "The difference between Standard and Instant Recharge on GETWAYS is in the speed of adding funds to your wallet: 1. **Standard Recharge:** This option offers traditional recharge methods with multiple denomination options. The funds may take some time to reflect in your wallet, as it follows the standard processing time. 2. **Instant Recharge:** With Instant Recharge, users can add funds to their wallet instantly using various payment methods. This feature provides a quick way to top up your wallet for immediate use. Feel free to ask if you have any more questions or need further clarification on the recharge methods!",

  "Can I use my wallet funds for Instant Recharge?":
    "Yes, on GETWAYS, you can use your wallet funds for Instant Recharge. This feature allows you to instantly add funds to your wallet using the balance already available in your account. It provides a convenient way to top up your wallet without the need for additional external payments. If you have any more questions or need further assistance, feel free to ask!",

  "How does the payment portal work for recharges?":
    "The payment portal on GETWAYS for recharges provides users with a convenient way to select their preferred payment method. Here's how it works: - When you initiate a recharge, you'll be presented with a dropdown menu in the payment portal. - The dropdown menu allows you to choose your desired payment method from the available options. - Once you select your payment method, you can proceed with the recharge transaction using the chosen payment method. - This feature gives users flexibility in choosing how they want to add funds to their wallet. If you have any more questions about the payment portal or any other aspect of recharging, feel free to ask!",

  // Recharge Amounts
  "What denomination options are available for recharge?":
    "GETWAYS offers multiple denomination options for recharge, including: $10, $15, $20, $30, $40, $50, $75, and $100.",

  "Can I recharge a custom amount?":
    "Currently, the platform offers predefined denominations for recharge: 10, 15, 20, 30, 40, 50, 75, and 100. Custom amounts are not supported at the moment. If you have any other questions or need further assistance, feel free to ask!",

  "What are the minimum and maximum recharge amounts?":
    "The recharge denominations range from $10 to $100. If you have any other questions about recharge denominations or any other topic, feel free to ask!",

  // Recharge History
  "How can I view my recent recharge transactions?":
    "To view your recent recharge transactions, you can navigate to the Recharge section on the platform. Within the Recharge section, you will find an option to access your recharge history, which will display your most recent transactions. If you need more detailed information or assistance with this process, feel free to let me know!",

  "How long does GETWAYS keep recharge history?":
    "GETWAYS maintains your complete transaction history for 12 months. After that period, summary information is still available but detailed transaction data may be archived.",

  "Why is my recharge showing as pending?":
    "Recharges may show as 'pending' when the payment is being processed but hasn't been fully confirmed yet. Standard recharges typically remain pending for up to 2 hours. If it remains pending longer, please contact support.",

  // Recharge Notes
  "How can I add a transaction note during recharge?":
    "When completing a recharge, you'll see an optional 'Add Note' field before confirming your transaction. Enter any relevant information you want to associate with this transaction for your records.",

  "What can transaction notes be used for?":
    "Transaction notes help you track the purpose of specific recharges. You might use them to note which game the funds are for, which player they're intended for, or any other relevant information for your personal record-keeping.",

  // Recharge Issues
  "My recharge payment was deducted but not credited":
    "If your payment was deducted but not credited to your GETWAYS account, please wait up to 2 hours as some processing delays can occur. If the funds don't appear after 2 hours, contact support with your transaction ID and payment confirmation.",

  "How long does recharge processing normally take?":
    "Standard Recharges typically process within 1-2 hours. Instant Recharges process immediately. Processing times may vary based on payment method and network conditions.",

  "Can I cancel a pending recharge?":
    "Pending recharges cannot be canceled once submitted. If you need assistance with a pending recharge, please contact customer support with your transaction details.",

  "Why was my recharge attempt declined?":
    "Recharge attempts may be declined for several reasons, including insufficient funds, payment method restrictions, security verifications, or reaching account limits. Check that your payment method is valid and try again, or use a different payment method.",

  // Redeem Amounts
  "What denominations are available for redemption?":
    "GETWAYS offers redemption in denominations of $25, $50, $100, $250, and $500. Specific redemption options may vary based on your account type and verification status.",

  "Is there a minimum and maximum redeem amount?":
    "The minimum redemption amount is $25. The maximum redemption amount is $500 per transaction for standard accounts and up to $2,000 for verified accounts, with a daily limit that varies by account level.",

  "Can I redeem a custom amount?":
    "Yes, you can redeem custom amounts by selecting 'Custom Amount' in the redemption menu. The amount must fall within the minimum and maximum limits and may be subject to rounding based on available gift card denominations.",

  // Redeem Fee
  "What service fee applies to redemptions?":
    "GETWAYS applies a standard service fee of 2.5% on all redemptions. Premium account holders may qualify for reduced fees of 1.5% or 1% depending on their membership tier.",

  "How is the redemption service fee calculated?":
    "The redemption service fee is calculated as a percentage of the total redemption amount. For example, a $100 redemption with a 2.5% fee would result in a $2.50 fee, meaning you receive $97.50 in value.",

  "Are there any fee-free redeem options?":
    "GETWAYS occasionally offers promotional fee-free redemption periods. Additionally, Platinum tier members receive one fee-free redemption per month. Check the promotions section for current offers.",

  "Can the service fee change based on redemption amount?":
    "Yes, redemptions over $500 may qualify for a reduced service fee of 2%. Redemptions over $1,000 for verified accounts may qualify for a 1.5% service fee. These tiered fees are automatically applied at checkout.",

  // Redeem Time
  "How long does the redemption process take?":
    "Standard redemptions are typically processed within 2 hours. During high-volume periods, processing may take up to 24 hours. Premium account holders receive priority processing.",

  "Why is my redemption taking longer than 2 hours?":
    "Redemption delays can occur due to system maintenance, security verifications, high transaction volumes, or issues with the selected redemption method. If your redemption exceeds 24 hours, please contact customer support.",

  "What causes redemption delays?":
    "Redemption delays may be caused by additional security verifications for unusual activity, system maintenance windows, technical issues with gift card providers, or high transaction volumes during peak periods.",

  // Redeem History
  "Where can I see my redemption history?":
    "Your redemption history is available in the Wallet section under 'Transaction History.' Filter by 'Redemption' to see all your redemption transactions, including status, amount, fees, and dates.",

  "What does it mean if my redemption is marked as expired?":
    "A redemption marked as 'expired' means the transaction was initiated but not completed within the required timeframe. This could be due to verification issues or system problems. Expired redemptions are typically refunded to your wallet automatically.",

  "Can I view the total number of redemption transactions?":
    "Yes, your account dashboard shows summary statistics including total number of redemptions. For detailed analysis, the Transaction History section allows you to filter and count specific types of redemptions.",

  // Redeem Notes
  "How can I add a transaction note during redemption?":
    "Before confirming your redemption, you'll see an optional 'Add Note' field where you can enter any information you want to associate with this transaction for your future reference.",

  "What can transaction notes be used for in redemptions?":
    "Transaction notes for redemptions help you track the purpose or recipient of specific redemptions. You might note which player the funds are for, which game they relate to, or any other relevant information for your records.",

  // Wallet Balance
  "How to check my current wallet balance?":
    "Your current wallet balance is displayed prominently on your dashboard after logging in. You can also check it by navigating to the Wallet section where you'll see your available balance and pending transactions.",

  "Why is my balance not updating?":
    "Balance updates may be delayed due to pending transactions or system refreshes. Try refreshing the page or logging out and back in. If the issue persists, check your transaction history to verify recent activity and contact support if needed.",

  "Is there a maximum balance limit for my wallet?":
    "Yes, standard accounts have a wallet balance limit of $5,000. Verified accounts can hold up to $10,000, while premium accounts have limits up to $25,000. Contact support if you need a temporary increase for specific activities.",

  // Wallet Cashout
  "How does the cashout process work?":
    "To cashout, navigate to the Wallet section and select 'Cashout'. Choose your preferred cashout method (typically gift cards), select the amount, review the service fee, and confirm. Most cashouts process within 2 hours.",

  "What gift cards are available for cashout?":
    "GETWAYS offers a variety of popular gift cards for cashout including Amazon, Visa, Mastercard, Google Play, Apple, Steam, and many major retailers. The full selection is available in the Cashout section and varies by region.",

  "What are the cashout amount restrictions?":
    "Cashouts have a minimum amount of $25 and a maximum of $500 per transaction for standard accounts. Verified accounts can cashout up to $2,000 per transaction with daily and monthly limits based on account level.",

  // Wallet History
  "How can I view my complete wallet transaction history?":
    "Access your complete transaction history by going to Wallet > Transaction History. Here you can view all transactions, filter by type (recharge, redemption, transfers), search by date ranges, and export reports.",

  "What details are shown in the transaction history?":
    "Transaction history shows the date, transaction type, amount, fees, status, transaction ID, payment method used, and any notes you added. You can click on any transaction for additional details.",

  // Wallet Instant
  "How to use wallet funds for Instant Recharge?":
    "To use wallet funds for Instant Recharge, navigate to Wallet > Instant Recharge, enter the amount you wish to convert for immediate use, review the convenience fee, and confirm the transaction.",

  "Is there a limit to Instant Recharge amounts?":
    "Yes, Instant Recharge has a minimum of $10 and a maximum of $250 per transaction for standard accounts. Verified accounts can perform Instant Recharges up to $1,000 per transaction with daily limits.",

  "Are there any fees for using Instant Recharge?":
    "Yes, Instant Recharge incurs a 3% convenience fee for immediate processing. This fee is clearly displayed before you confirm the transaction. Premium account holders may qualify for reduced fees of 2% or 1.5%.",

  "Why can't I access the Instant Recharge option?":
    "The Instant Recharge option may be unavailable if your account is new (less than 7 days old), has suspicious activity flags, is under review, or if the feature is temporarily disabled for system maintenance.",

  // Gift Card Management
  "How to view all my gift cards?":
    "To view all your gift cards, go to Account > My Gift Cards. Here you'll see all active gift cards with details including card type, amount, activation date, expiration date, and remaining balance if applicable.",

  "How to see my expired gift cards?":
    "In the Gift Cards section, toggle the filter to show 'Expired Cards' or select 'Show All' and look for cards marked as expired. You can view details of expired cards but cannot use them for transactions.",

  "How can I find a specific gift card by order ID?":
    "In the Gift Cards section, use the search function and enter the order ID in the search field. This will display the specific gift card associated with that order ID along with all its details.",

  // Gift Card Cashout
  "How to cashout my wallet balance to a gift card?":
    "To cashout to a gift card, go to Wallet > Cashout > Gift Card, select your preferred gift card type, enter the amount (within available balance), review the service fee, and confirm to complete the transaction.",

  "Can I select multiple gift cards for a single cashout?":
    "Yes, GETWAYS allows splitting a single cashout across multiple gift cards. During the cashout process, select 'Multiple Cards', choose the card types and specify the amount for each before confirming.",

  // Support Balance
  "How do I check my available balance?":
    "Your available balance is displayed on your dashboard after login. For a more detailed view including pending transactions, navigate to the Wallet section where you'll see your full balance breakdown.",

  "What should I do if my balance is incorrect?":
    "If your balance appears incorrect, first check your recent transaction history for pending or recent transactions. If the discrepancy persists, contact customer support with details of the expected balance and relevant transaction IDs.",

  // Support Gift Card
  "What should I do if my gift card is not working?":
    "If your gift card isn't working, verify it hasn't expired and confirm you're entering the correct code. Screenshot the error message if possible, then contact support with your order ID, gift card details, and the error you're experiencing.",

  "How to check if a gift card is expired?":
    "Gift card expiration dates are listed in your Gift Cards section. Select the specific card to view its full details including the expiration date. Most gift cards issued through GETWAYS have an expiration date of 12 months from issue.",

  "Can I replace an expired gift card?":
    "Expired gift cards cannot typically be replaced. Gift card values should be used before expiration. In some cases, premium account holders may qualify for a one-time courtesy extension or partial value recovery. Contact support to explore options.",

  // Support Transaction
  "How do I verify a transaction issue?":
    "To verify a transaction issue, go to Wallet > Transaction History and locate the specific transaction. Note its status, ID, and details. Screenshot any error messages and provide this information when contacting support for faster resolution.",

  "What should I do if a transaction is pending for too long?":
    "If a transaction is pending beyond the expected timeframe (2 hours for standard transactions), wait 24 hours as some delays can occur. If still pending after 24 hours, contact support with the transaction ID and details.",

  "Why did my transaction fail?":
    "Transactions may fail due to insufficient funds, payment method issues, security verifications, reaching account limits, or technical issues. Check your transaction history for specific failure reasons and try again with a different method if needed.",

  // Account Login
  "Can I sign up directly on GETWAYS?":
    "GETWAYS accounts are created through our partner networks. You cannot sign up directly on GETWAYS. If you need an account, please contact one of our authorized partners or agents who can set up your access credentials.",

  // Account Profile
  "What options are available in the profile dropdown?":
    "The profile dropdown menu includes: Account Settings, Security Settings, Transaction History, My Gift Cards, Help & Support, Video Tutorials, and Logout. Premium accounts may see additional options for exclusive features.",

  "How do I change my account password?":
    "To change your password, click on your profile icon, select 'Security Settings', then choose 'Change Password'. Enter your current password, set a new password, confirm it, and save the changes.",

  "How do I access the help video ?":
    "Help videos are accessible through your profile dropdown menu under 'Video Tutorials'. You'll find a library of instructional videos covering various features and common procedures on the GETWAYS platform.",
};
