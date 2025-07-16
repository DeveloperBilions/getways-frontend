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
    "On GETWAYS, there are three recharge methods available: 1. Quick Debit Recharge (Coinbase Onramp): Instantly top up your account using your debit card via Coinbase. It's fast and secure. 2. Instant Recharge (Wert/Wallet): Recharge via your linked Wallet or through the Payment Portal. Quick, safe, and perfect for verified users. 3. Standard Recharge (External Link): Complete your payment through an external crypto platform. Flexible option, but ensure you send the exact amount to the correct wallet address.",

  "How does Quick Debit Recharge work with Coinbase?":
    "Quick Debit Recharge is a fast and secure payment method powered by Coinbase. When you choose Quick Debit, you'll be directed to the Coinbase-powered interface to complete your payment. Simply follow the on-screen instructions to finish the transaction securely. If you have any more questions about the recharge methods or any other features, feel free to ask!",

  "What is the difference between Standard and Instant Recharge?":
    "Standard Recharge and Instant Recharge are two options available for adding funds to your wallet on the platform.\n\n   1. **Standard Recharge**: This option allows you to complete your payment through an external crypto platform. You would need to copy your wallet address and proceed to the provided link. It offers flexibility, but you must ensure to send the exact amount to the correct wallet address to avoid delays.\n\n   2. **Instant Recharge**: With Instant Recharge, you can quickly and seamlessly top up your account using your linked Wallet or through the Payment Portal on the platform. It's a fast and safe option for verified users. You can select your method, add a note if needed, and proceed with the recharge instantly.",

  "Can I use my wallet funds for Instant Recharge?":
    "Yes, you can use your wallet funds for Instant Recharge. It's a convenient way to quickly top up your account using the funds in your wallet. If you have any more questions about the recharge process or any other topic, feel free to ask!",

  "How does the payment portal work for recharges?":
    "The payment portal for recharges allows users to select their preferred payment method from a dropdown menu. Once the method is selected, users can proceed with the transaction by adding a note if needed. The portal ensures a seamless and secure payment process for recharging your account. If you have any specific questions about the payment portal or need more details, feel free to ask!",

  // Recharge Denominations
  "What denomination options are available for recharge?":
    "GETWAYS offers multiple denomination options for recharge, including: $10, $15, $20, $30, $40, $50, $75, and $100.",

  "Can I recharge a custom amount?":
    "Currently, the platform offers predefined denominations for recharge: 10, 15, 20, 30, 40, 50, 75, and 100. Custom amounts are not supported at the moment. If you have any other questions or need further assistance, feel free to ask!",

  "What are the minimum and maximum recharge amounts?":
    "The recharge denominations range from $10 to $100. If you have any other questions about recharge denominations or any other topic, feel free to ask!",

  // Recharge History
  "How can I view my recent recharge transactions?":
    "To view your recent recharge transactions, you can navigate to the Recharge section on the platform. There, you will find an option to view your recharge history, which will display your most recent transactions. If you need further assistance or have any other questions, feel free to ask!",

  "How long does GETWAYS keep recharge history?":
    "GETWAYS keeps recharge history for your account indefinitely. You can always refer back to see your past recharges on the platform. If you have any other questions or need more information, feel free to ask!",

  "Why is my recharge showing as pending?":
    "If your recharge is showing as pending, it means that the transaction is currently being processed. Recharges can take some time to complete, so it's normal for them to show as pending until the process is finalized. If you have any concerns or if the transaction takes longer than expected, you can always check the status in your recent transaction history or reach out to our support team for further assistance.",

  // Recharge Transaction Notes
  "How can I add a transaction note during recharge?":
    "During a recharge, you can add a transaction note to keep a record or include a custom message. Here's how you can do it: 1. When you initiate a recharge, there should be an option or field where you can input a transaction note. 2. Simply enter your note or message in that field before completing the recharge process. 3. This note will be associated with that particular recharge transaction for your reference. If you have any more questions or need further clarification, feel free to ask!",

  "What can transaction notes be used for?":
    "Transaction notes can be used for record keeping or to add custom messages to your transactions. They provide you with a way to personalize or keep track of your financial activities within the platform.",

  // Recharge Troubleshooting
  "My recharge payment was deducted but not credited":
    "If your recharge payment was deducted but not credited to your account, I recommend checking your transaction history to see if the payment was processed but not reflected in your balance. If you don't see the transaction there, you may need to reach out to customer support for further assistance. They can investigate the issue and help resolve it for you.",

  "How long does recharge processing normally take?":
    "Recharge processing times can vary depending on the method used. For Quick Debit recharges, the processing is usually instant. However, for Instant or Standard Recharges, the processing time may take a few minutes to reflect in your account. Let me know if you need more information on recharging or any other topic!",

  "Can I cancel a pending recharge?":
    "Unfortunately, the platform does not currently offer a feature to cancel a pending recharge. If you have any other questions or need further assistance, feel free to ask!",

  "Why was my recharge attempt declined?":
    "There could be various reasons why a recharge attempt may be declined. It could be due to insufficient funds in your payment method, an issue with the payment gateway, or potentially an error in the transaction details. If you encounter a declined recharge, it's recommended to double-check your payment information and try again. If the issue persists, you may want to contact our support team for further assistance.",

  // Redeem Amounts
  "What denominations are available for redemption?":
    "The redemption denominations available on the platform are 20, 50, 100, 200, and 500. Is there anything else you would like to know about redemption amounts?",

  "Is there a minimum and maximum redeem amount?":
    "The redemption amounts available on the platform are 20, 50, 100, 200, and 500. There is no specific minimum or maximum redemption amount outside of these fixed denominations.",

  "Can I redeem a custom amount?":
    "Currently, the redemption options available are fixed amounts like 20, 50, 100, 200, and 500. Custom redemption amounts are not supported at the moment. If you have any other questions or need further assistance, feel free to ask!",

  // Redeem Service Fee
  "What service fee applies to redemptions?":
    "The service fee that applies to redemptions can vary based on the current rate set by the system. Would you like more details on how the service fee is calculated or any other information related to redemptions?",

  "How is the redemption service fee calculated?":
    "The redemption service fee is calculated as a percentage set by the system. If you have any specific questions about the redemption service fee calculation or need more details, feel free to ask!",

  "Are there any fee-free redeem options?":
    "Currently, there are service fees applied to all redemption transactions on the platform. If you have any other questions or need more details, feel free to ask!",

  "Can the service fee change based on redemption amount?":
    "Yes, the service fee for redemptions can vary based on the redemption amount. The system may calculate the service fee as a percentage of the redemption amount, so larger redemptions might incur a higher fee compared to smaller ones. The exact percentage rate for the service fee would be determined by the system in place. If you need more specific details or have any other questions, feel free to ask!",

  // Redeem Processing Time
  "How long does the redemption process take?":
    "The redemption process may take up to 2 hours to complete. If you have any more questions or need further assistance, feel free to ask!",

  "Why is my redemption taking longer than 2 hours?":
    "If your redemption is taking longer than the expected 2-hour processing time, it could be due to various reasons such as high transaction volumes, technical issues, or additional verification requirements. It's recommended to wait a bit longer for the redemption to process, and if the delay continues, you can reach out to the support team for assistance.",

  "What causes redemption delays?":
    "Redemption delays can occur due to various reasons such as high transaction volumes, network issues, or verification processes. Sometimes, additional security checks or system maintenance may also contribute to delays in processing redemptions. If you have a specific concern about a redemption delay, it's recommended to check the status in your transaction history or reach out to customer support for further assistance.",

  // Redeem History
  "Where can I see my redemption history?":
    "You can view your redemption history in the Redeem section of the platform. Just navigate to the Redeem section, and you'll find your recent redemption transactions listed there. If you need more detailed information or have any other questions, feel free to ask!",

  "What does it mean if my redemption is marked as expired?":
    "If your redemption is marked as expired, it typically means that the redemption process was not completed within the system's specified timeframe. Redemptions may have an expiration period after which they are no longer valid. If you encounter an expired redemption status, you may need to contact support for further assistance.",

  "Can I view the total number of redemption transactions?":
    "Yes, you can view the total number of redemption transactions in the Redemption History section. It dynamically displays the transaction count based on your history. Would you like more information on this or need help with something else?",

  // Redeem Notes
  "How can I add a transaction note during redemption?":
    "To add a transaction note during redemption, you can include a message or any relevant details when you initiate the redemption process. Just look for the option to add a note before finalizing your redemption request. Let me know if you need more details or have any other questions!",

  "What can transaction notes be used for in redemptions?":
    "Transaction notes in redemptions can be used for record keeping or adding custom messages. They allow users to track and add specific details to their redemptions for better organization or personalization.",

  // Wallet Balance
  "How to check my current wallet balance?":
    "To check your current wallet balance, you can simply visit the Wallet section on the platform. Your available balance will be dynamically displayed there. If you have any more questions or need further assistance, feel free to ask!",

  "Why is my balance not updating?":
    "If your balance is not updating, there could be a few reasons for this: 1. Network Issues: Sometimes, delays in network communication can cause the balance to not update immediately. 2. Transaction Processing: If you've recently made a transaction, it may take some time to reflect in your balance. 3. Technical Glitch: There might be a technical issue on the platform that is preventing the balance from updating in real-time. If you've waited for a while and the balance still hasn't updated, it might be helpful to refresh the page or log out and log back in to see if the balance refreshes correctly. If the issue persists, you can reach out to our support team for further assistance.",

  "Is there a maximum balance limit for my wallet?":
    "As of now, there is no mention of a maximum balance limit for the wallet on the platform. Users can deposit funds into their wallet without a specified maximum limit.",

  // Wallet Cashout
  "How does the cashout process work?":
    "The cashout process involves accessing the Cashout feature in the Wallet section, selecting an amount to cashout, choosing a gift card to receive the funds, and confirming the transaction. Here's a general overview: 1. Access Cashout: Go to the Wallet section and click on the Cashout option. 2. Select Amount: Choose the amount you want to cash out from your wallet balance. 3. Choose Gift Card: Select a gift card from the available options to receive your funds. 4. Confirm: Verify the details of the cashout transaction and confirm to complete the process. Remember to follow the prompts and ensure the cashout amount meets the minimum requirements and does not exceed your current balance. If you encounter any issues during the process, feel",

  "What gift cards are available for cashout?":
    "For cashout, we offer various gift card options including Mastercard eReward Virtual Accounts, Rainforest Cafe, Venue gift cards, and more. If you need more details about a specific gift card, feel free to ask!",

  "What are the cashout amount restrictions?":
    "There are several cashout amount restrictions in place to ensure a smooth process: 1. Cashout amount should not be less than $15. 2. Cashout amount cannot exceed your current balance. 3. Cashout amount cannot be negative or zero. These restrictions help maintain the integrity of the cashout process. If you have any other questions or need more details, feel free to ask!",

  // Wallet History
  "How can I view my complete wallet transaction history?":
    "To view your complete wallet transaction history, you can access the Transaction History section in your Wallet. It will display detailed timestamps for all your transactions, including the date and time, transaction status, and transaction amounts. You can track your recent activity and see the last 5 transactions in the recent transactions section. If you need more specific information or have any other questions, feel free to ask!",

  "What details are shown in the transaction history?":
    "In the Transaction History section, you can expect to see detailed timestamps for all transactions, including the date and time of each transaction. The history will also display the transaction status, clearly showing whether the transaction was successful, expired, or pending. Additionally, you will find the transaction amounts clearly displayed for each transaction. The Recent Transactions section typically shows the last 5 transactions for quick reference.",

  // Wallet Instant
  "How to use wallet funds for Instant Recharge?":
    "To use your wallet funds for Instant Recharge, you can follow these steps: 1. Go to the Instant Recharge section on the platform. 2. Select the option to recharge using your wallet funds. 3. Choose the amount you want to recharge with. 4. Confirm the transaction and your wallet funds will be used for the Instant Recharge. If you have any more questions or need further assistance, feel free to ask!",

  "Is there a limit to Instant Recharge amounts?":
    "The Instant Recharge feature offers multiple denomination options ranging from 10 to 100. You can choose the amount that fits your needs within that range. If you have any more questions or need further details, feel free to ask!",

  "Are there any fees for using Instant Recharge?":
    "Yes, there are no fees for using Instant Recharge on our platform. It offers a seamless top-up experience without any additional charges.",

  "Why can't I access the Instant Recharge option?":
    "If you're having trouble accessing the Instant Recharge option, it could be due to a few reasons: 1. Verification Status: Ensure that your account is fully verified to use all features, including Instant Recharge. 2. Balance: Check if you have sufficient funds in your wallet to use the Instant Recharge feature. 3. Technical Issues: Sometimes, technical glitches can temporarily prevent access to certain features. Try refreshing the page or logging in again. If none of these reasons apply to your situation, please provide more details so I can assist you further.",

  // Gift Card Management
  "How to view all my gift cards?":
    "To view all your gift cards, you can navigate to the Gift Card section on the platform. There, you will find options to see your available gift cards, expired gift cards, and details about each card from various merchants. If you have any specific questions or need further assistance regarding your gift cards, feel free to ask!",

  "How to see my expired gift cards?":
    "To view your expired gift cards, you can check the Gift Card section on the platform. There, you'll find a breakdown of your available, expired, and total gift cards. If you have any specific expired cards you want to retrieve information on, you can click on the expired gift card section for more details.",

  "How can I find a specific gift card by order ID?":
    "To find a specific gift card by order ID, you can use the search functionality within the Gift Card section. Simply enter the order ID of the gift card you are looking for, and the system will help you locate it. If you encounter any issues or need further assistance, feel free to let me know!",

  // Gift Card Cashout
  "How to cashout my wallet balance to a gift card?":
    "To cash out your wallet balance to a gift card, you can follow these steps: 1. Go to the Wallet section on the platform. 2. Click on the Cashout option. 3. Select the amount you want to cash out. 4. Choose a gift card from the available options. 5. Confirm your selection to complete the cashout process. If you encounter any issues or need further assistance during the cashout process, feel free to ask!",

  "Can I select multiple gift cards for a single cashout?":
    "During the cashout process, you can only select one gift card for a single transaction. If you have multiple gift cards you wish to cash out, you will need to do separate cashout transactions for each card. Let me know if you need more information on this or anything else!",

  // Support Balance
  "How do I check my available balance?":
    "To check your available balance, you can simply visit the Wallet section on the platform. Your current balance will be dynamically displayed there.",

  "What should I do if my balance is incorrect?":
    "If you believe your balance is incorrect, you can reach out to our support team for assistance. They can help investigate and resolve any discrepancies in your balance. You can find the support contact information in the app or on our website.",

  // Support Gift Card
  "What should I do if my gift card is not working?":
    "If your gift card is not working, you can usually resolve the issue by contacting the customer support of the specific gift card provider. They can help troubleshoot the problem and provide assistance with using the gift card. If you have any specific concerns related to the gift cards available on our platform, feel free to share the details for more targeted assistance.",

  "How to check if a gift card is expired?":
    "To check if a gift card is expired, you can visit the Gift Card section on the platform. There, you should be able to view all your gift cards, including any expired ones. If you need further assistance or have any other questions, feel free to ask!",

  "Can I replace an expired gift card?":
    "Unfortunately, expired gift cards cannot be replaced. Gift cards are typically valid for a specific period, and once they expire, they are no longer usable. If you have any other questions or need assistance with your gift cards, feel free to let me know!",

  // Support Transaction
  "How do I verify a transaction issue?":
    "To verify a transaction issue, you can check the respective transaction history section related to the transaction in question. Each section (Recharge, Redeem, Wallet) has its own transaction history where you can review details like timestamps, transaction amounts, and status updates for your transactions. If you encounter any discrepancies or errors, you can reach out to our support team for further assistance.",

  "What should I do if a transaction is pending for too long?":
    "If a transaction is pending for an extended period, it is best to wait a bit longer as some transactions may take time to process. If the transaction remains pending for an unusually long time and you have concerns, you can reach out to our support team for further assistance. You can also check the specific transaction status in the respective transaction history section on the platform.",

  "Why did my transaction fail?":
    "Transactions can fail for various reasons such as insufficient funds, technical issues, or security checks. If you provide more details about the specific transaction, I can help you further.",

  // Account Login
  "Can I sign up directly on GETWAYS?":
    "On GETWAYS, users cannot sign up directly. If you're looking for information on the login process or account creation, feel free to ask!",

  // Account Profile
  "What options are available in the profile dropdown?":
    "In the profile dropdown, you will find three options: 1. Change Password: Allows you to change your current password by entering your old password and the new one. 2. Help Video: Opens a page with videos for login and sign-in help. This feature is available for pre-registered users with a shared sign-in form Referral Link from an agent. 3. Logout: Immediately logs you out of your session.",

  "How do I change my account password?":
    "To change your account password, you can follow these steps: 1. Click on the profile icon at the top right of the screen to open the dropdown menu. 2. Select Change Password from the dropdown options. 3. You will be directed to a form where you can enter your old password and then set a new password. 4. Once you've entered the required information, submit the form to update your password. If you have any other questions or need further assistance, feel free to ask!",

  "How do I access the help video ?":
    "To access the Help Video in the Profile Menu, you need to be a pre-registered user with a shared sign-in form Referral Link from an agent. Once you have that, you can click on the profile icon at the top right of the screen, open the dropdown menu, and then select the Help Video option. This will take you to the page with videos for help with login and sign-in. If you have any more questions or need further assistance, feel free to ask!",
};

export const masterAgentMainOptions = [
  { id: "user-management", label: "User Management", icon: "👥" },
  { id: "recharge-records", label: "Recharge Records", icon: "💰" },
  { id: "redeem-records", label: "Redeem Records", icon: "🎁" },
  { id: "summary", label: "Summary", icon: "📊" },
  { id: "profile", label: "Profile Options", icon: "👤" },
  { id: "other", label: "Other", icon: "🤷‍♂️" },
];

export const masterAgentSubOptions = {
  "user-management": [
    { id: "view-users", label: "View Agents & Players", icon: "📋" },
    { id: "add-user", label: "Add New User", icon: "➕" },
    { id: "agent-actions", label: "Agent Actions", icon: "⚙️" },
    { id: "player-actions", label: "Player Actions", icon: "🎮" },
    { id: "filter-users", label: "Filter Users", icon: "🔍" },
  ],
  "recharge-records": [
    { id: "view-recharges", label: "View Recharge Records", icon: "📜" },
    { id: "filter-recharges", label: "Filter Recharges", icon: "🔍" },
    { id: "export-recharges", label: "Export Recharge Data", icon: "📤" },
  ],
  "redeem-records": [
    { id: "view-redeems", label: "View Redeem Records", icon: "📜" },
    { id: "filter-redeems", label: "Filter Redeems", icon: "🔍" },
    { id: "export-redeems", label: "Export Redeem Data", icon: "📤" },
  ],
  summary: [
    { id: "view-summary", label: "View Summary", icon: "📊" },
    { id: "filter-summary", label: "Filter by Date", icon: "📅" },
    { id: "search-users", label: "Search Agents/Players", icon: "🔍" },
  ],
  profile: [
    { id: "change-password", label: "Change Password", icon: "🔑" },
    { id: "recharge-limit", label: "Set Recharge Limits", icon: "⚖️" },
    { id: "help-videos", label: "Help Videos", icon: "🎥" },
    { id: "logout", label: "Logout", icon: "🚪" },
    { id: "balance", label: "View Balance", icon: "💸" },
  ],
};

export const masterAgentFinalOptions = {
  "view-users": [
    "How can I view the list of Agents and Players under me?",
    "What details are shown in the User Management table?",
    "How do I check the Parent User of an Agent or Player?",
  ],
  "add-user": [
    "How do I create a new Agent using the 'Add New User' option?",
    "What information is required to add a new Agent?",
    "Can I add a Player directly as a Master Agent?",
  ],
  "agent-actions": [
    "How can I disable recharge for a specific Agent?",
    "How do I set daily and monthly recharge limits for an Agent?",
    "How can I allow an Agent to reset their Players' passwords?",
    "How do I enable an Agent to create new Players?",
    "How can I edit or delete an Agent's details?",
  ],
  "player-actions": [
    "How do I perform a recharge for a Player?",
    "How can I redeem funds for a Player?",
    "How do I view a Player's wallet details?",
    "How can I copy a Player's wallet address?",
    "How do I access BaseScan or EtherScan for a Player's transactions?",
    "How can I edit or delete a Player's details?",
  ],
  "filter-users": [
    "How can I filter Agents and Players by Email or Username?",
    "What filters are available in the User Management section?",
  ],
  "view-recharges": [
    "How can I view all Recharge Records for Agents and Players?",
    "What details are included in the Recharge Records list?",
  ],
  "filter-recharges": [
    "How do I filter Recharge Records by Account, Status, or Mode?",
    "What statuses can I filter Recharge Records by?",
  ],
  "export-recharges": [
    "How can I export Recharge Records in PDF or Excel format?",
    "What data is included in the exported Recharge Records?",
  ],
  "view-redeems": [
    "How can I view all Redeem Records for Agents and Players?",
    "What information is shown in the Redeem Records list?",
  ],
  "filter-redeems": [
    "How do I filter Redeem Records by Account or Status?",
    "What statuses are available for filtering Redeem Records?",
  ],
  "export-redeems": [
    "How can I export Redeem Records in PDF or Excel format?",
    "What data is included in the exported Redeem Records?",
  ],
  "view-summary": [
    "What information is included in the Summary section?",
    "How can I view the total number of users and Agents?",
    "How do I check total Recharges and Redeems?",
  ],
  "filter-summary": [
    "How can I filter the Summary by date?",
    "What date ranges are available for filtering the Summary?",
  ],
  "search-users": [
    "How do I search for a specific Agent or Player in the Summary?",
    "What details can I see for searched users in the Summary?",
  ],
  "change-password": [
    "How do I change my Master Agent account password?",
    "What should I do if I encounter issues changing my password?",
  ],
  "recharge-limit": [
    "How do I set Recharge Limits for Agents and Players?",
    "What are the minimum and maximum Recharge Limits I can set?",
  ],
  "help-videos": [
    "How can I access Help Videos for Login and Sign Up processes?",
    "What topics are covered in the Help Videos?",
  ],
  logout: [
    "How do I log out of my Master Agent account?",
    "What happens to my session after logging out?",
  ],
  balance: [
    "How is the Master Agent Balance calculated?",
    "Why does my balance reflect the combined balance of Agents and Players?",
    "How can I view my current balance?",
  ],
};

export const masterAgentFinalAnswers = {
  // View Users
  "How can I view the list of Agents and Players under me?":
    "To view the list of Agents and Players under you, you can access the User Management section in the Master Agent dashboard. There, you will see a list that includes User Name, Email, Parent User, User Type, and Date for each Agent and Player. You can also filter Agents and Players by Email and Username to quickly locate specific individuals. If you want to perform actions on a particular Agent or Player, you can use the Actions button in the table to access options such as Disable Recharge, Recharge Limits, Password Permission, Allow Creation Permission, Edit, and Delete for Agents, as well as Redeem, Recharge, Wallet, View Key, BaseScan, EtherScan, Edit, and Delete for Players.",
  "What details are shown in the User Management table?":
    "In the User Management table, you can view and manage a list of all Agents and Players under you. The details displayed include User Name, Email, Parent User, User Type, and Date. Additionally, you can create a new Agent using the Add New User option. If you click on the Actions button in the table, you can access specific actions for Agents and Players under you, such as disabling recharge, setting recharge limits, allowing password permission, creation permission, editing, and deleting user details.",
  "How do I check the Parent User of an Agent or Player?":
    "To check the Parent User of an Agent or Player in the Master Agent section, you can view the list of Agents and Players under you. The Parent User column in the list will show you the user who is directly above the Agent or Player in the hierarchy. This way, you can easily identify the Parent User associated with each Agent or Player. If you need more details or assistance, feel free to ask!",

  // Add User
  "How do I create a new Agent using the 'Add New User' option?":
    "To create a new Agent using the 'Add New User' option in the User Management section of the GETWAYS platform, you would typically follow these steps: 1. Navigate to the User Management section. 2. Look for the 'Add New User' option. 3. Click on 'Add New User' to begin creating a new Agent. 4. Fill in the required information for the new Agent, such as User Name, Email, Parent User (Master Agent), User Type, and Date. 5. Once you have entered all the necessary details, you should be able to save or submit the information to create the new Agent in the system. If you need more specific guidance or have any other questions, feel free to ask!",
  "What information is required to add a new Player?":
    "When adding a new Player, the following information is required to be filled out: - Username - Name - Phone Number - Email - Password - Confirm Password Is there anything else you would like to know about adding a new Player?",
  "Can I add a Player directly as a Master Agent?":
    "As a Master Agent, you can only add Agents directly. Players can be added by Agents under your supervision. If you need to add a Player, you would need to ask one of your Agents to create the Player account for you.",

  // Agent Actions
  "How can I disable recharge for a specific Agent?":
    "To disable recharge for a specific Agent, you can do the following: 1. Access the User Management section. 2. Find and select the Agent for whom you want to disable the recharge. 3. Click on the Actions button in the table. 4. Within the available actions, you should see an option to Disable Recharge. Simply click on that option to disable recharge for the selected Agent.",
  "How do I set daily and monthly recharge limits for an Agent?":
    "To set daily and monthly recharge limits for an Agent, follow these steps: 1. Go to the User Management section and locate the Agent for whom you want to set the limits. 2. Click on the Actions button in the table next to the Agent's name. 3. Select the Recharge Limits option from the available actions. 4. In the Recharge Limits popup, you can set the daily and monthly recharge limits for that specific Agent. 5. Once you've entered the desired limits, save the changes. 6. The Agent will now have the daily and monthly recharge limits set as per your configuration. If you have any more questions or need further assistance, feel free to ask!",
  "How can I allow an Agent to reset their Players' passwords?":
    "To allow an Agent to reset their Players' passwords, you can grant them the Password Permission in the User Management section. Here are the steps: 1. Go to the User Management section of the Master Agent platform. 2. Find the specific Agent for whom you want to allow password resets for their Players. 3. Click on the Actions button next to the Agent's details. 4. Select the Password Permission option from the available actions. 5. Once you enable this permission, the Agent will be able to set or reset passwords for their Players as needed. If you need further assistance or have any more questions, feel free to ask!",
  "How do I enable an Agent to create new Players?":
    "To enable an Agent to create new Players, you need to grant them the Allow Creation Permission through the User Management section. Here's how to do it: 1. Go to the User Management tab in the Master Agent section. 2. Find the specific Agent you want to grant permission to. 3. Click on the Actions button next to the Agent's name. 4. Select Allow Creation Permission from the available actions. 5. Once selected, the Agent will now have the ability to create new Players under their account. If you need further assistance or have any other questions, feel free to ask!",
  "How can I edit or delete an Agent's details?":
    "To edit or delete an Agent's details in the Master Agent section of GETWAYS, follow these steps: 1. Go to the User Management tab. 2. Locate the Agent you want to edit or delete from the list of Agents under you. 3. Click on the Actions button next to the Agent's name. 4. Select Edit to make changes to the Agent's details or select Delete to remove the Agent from the list. Remember to confirm any changes or deletions before proceeding. Let me know if you need further assistance!",

  // Player Actions
  "How do I perform a recharge for a Player?":
    "To perform a recharge for a Player, you can follow these steps in the Master Agent section: 1. Find the Player in the list of Players under you. 2. Click on the Actions button for that Player. 3. Select the Recharge option. 4. You will then be able to enter the recharge details such as the amount to recharge and the payment method. 5. Once you confirm the recharge details, the recharge action will be processed for that Player. If you need further assistance with this process or have any other questions, feel free to ask!",
  "How can I redeem funds for a Player?":
    "To redeem funds for a Player in the Master Agent section, you can follow these steps: 1. Find the Player for whom you want to redeem funds in the list of Players under you. 2. Click on the Actions button next to the Player's details. 3. Select the Redeem option. 4. Enter the amount you wish to redeem for the Player. 5. Confirm the transaction and follow any additional prompts to complete the redemption process. If you encounter any issues or need further assistance, feel free to ask!",
  "How do I view a Player's wallet details?":
    "To view a Player's wallet details, you can access the Player's profile and then click on the Wallet option. This will allow you to see the available balance, payment methods, and cashout status of the Player.",
  "How can I copy a Player's wallet address?":
    "To copy a Player's wallet address, you can access the Player's details in the User Management section. Click on the Player's name or username to view their information. Then, look for the View Key option. By selecting this option, you will be able to copy the Player's wallet address. Let me know if you need more assistance with this!",
  "How do I access BaseScan or EtherScan for a Player's transactions?":
    "To access BaseScan or EtherScan for a Player's transactions, you can click on the BaseScan or EtherScan option available under Player Actions in the User Management section. This will allow you to view transaction details related to the player you have selected. Let me know if you need more information or assistance with anything else!",
  "How can I edit or delete a Player's details?":
    "To edit or delete a Player's details in the Master Agent section, you can follow these steps: 1. Navigate to the User Management section. 2. Find the Player you wish to edit or delete in the list of Players under you. 3. Click on the Actions button next to the Player's details. 4. Select Edit to make changes to the Player's details or select Delete to remove the Player from your account. By following these steps, you can easily edit or delete a Player's details as a Master Agent. Let me know if you need further assistance!",

  // Filter Users
  "How can I filter Agents and Players by Email or Username?":
    "To filter Agents and Players by Email or Username in the User Management section, you can enter the name or username you want to filter in the search bar provided. This will help you quickly locate specific Agents or Players based on their Email or Username. If you need further assistance with filtering or any other aspect of User Management, feel free to ask!",
  "What filters are available in the User Management section?":
    "In the User Management section, you can filter Agents and Players by Name and Username. This allows you to quickly search for specific users based on their name or username. Is there anything else you would like to know about filtering users?",

  // View Recharges
  "How can I view all Recharge Records for Agents and Players?":
    "To view all Recharge Records for Agents and Players under you, you can access the Recharge Records section in the Master Agent dashboard. From there, you will be able to see a list of all the Recharge Records and can filter them by Account, Status, and Mode. Additionally, you have the option to export the data in PDF and Excel formats for further analysis. If you need more detailed instructions on how to navigate to the Recharge Records section or perform any specific actions within it, feel free to ask!",
  "What details are included in the Recharge Records list?":
    "The Recharge Records list includes details such as the account information, status of the recharge, and the mode used for the recharge. Additionally, you can filter the records by Account, Status, and Mode, and export the data in PDF and Excel formats for further analysis or record-keeping. If you need more specific details or assistance with the Recharge Records, feel free to ask!",

  // Filter Recharges
  "How do I filter Recharge Records by Account, Status, or Mode?":
    "To filter Recharge Records by Account, Status, or Mode in the Master Agent section of the GETWAYS platform, you can follow these steps: 1. Go to the Recharge Records section. 2. Look for the filter options provided, usually located at the top of the table or list of records. 3. You should see options to filter by Account, Status, and Mode. 4. Click on the filter option you want to apply (Account, Status, or Mode) and select the specific criteria you wish to filter by. 5. The records will then be filtered based on your selected criteria, allowing you to view the Recharge Records that match your filtering choices. If you need further assistance or have any more questions, feel free to ask",
  "What statuses can I filter Recharge Records by?":
    "You can filter Recharge Records by the following statuses: - Pending Referral - Pending Confirmation - Confirmed - Coin Credit - Expired - Failed Transaction Feel free to ask if you need more information or assistance!",

  // Export Recharges
  "How can I export Recharge Records in PDF or Excel format?":
    "To export Recharge Records in PDF or Excel format, you can follow these steps: 1. Go to the Recharge Records section in the Master Agent dashboard. 2. Filter the records as needed using the Account, Status, and Mode options. 3. Look for an export button or option on the page. It is usually located near the list of records or in a toolbar. 4. Click on the export button and choose the format you prefer - PDF or Excel. 5. The data will be generated in the selected format and you can download the file to your device. If you encounter any issues or need further assistance, feel free to ask!",
  "What data is included in the exported Recharge Records?":
    "When you export Recharge Records, the data typically includes information such as the account details, recharge status, recharge mode, and other relevant details related to the recharges made for Agents and Players under your management. Would you like more information on this topic?",

  // View Redeems
  "How can I view all Redeem Records for Agents and Players?":
    "To view all Redeem Records for Agents and Players, you can access the Redeem Records section in the Master Agent dashboard. From there, you'll be able to see a list of all the Redeem Records and filter them by Account and Status. Additionally, you can export the data in PDF and Excel formats for further analysis. If you need more detailed instructions on accessing this information, feel free to ask!",
  "What information is shown in the Redeem Records list?":
    "In the Redeem Records list, you can view the following information for each record: - Account: This indicates the account for which the redeem action was performed. - Status: This shows the status of the redeem transaction. - Date: The date on which the redeem transaction took place. - Amount: The amount that was redeemed. - Mode: The mode through which the redeem transaction was conducted. If you need more details or have any specific questions about the Redeem Records, feel free to ask!",

  // Filter Redeems
  "How do I filter Redeem Records by Account or Status?":
    "To filter Redeem Records by Account or Status in the Master Agent section of GETWAYS platform, you can use the filtering options available. Here's how you can do it: 1. Log in to your Master Agent account on the GETWAYS platform. 2. Navigate to the Redeem Records section. 3. Look for the filter options provided for filtering by Account and Status. 4. Select the desired filter criteria for Account or Status to refine the list of Redeem Records displayed. 5. Once you apply the filters, the Redeem Records will be displayed according to your selected criteria. If you encounter any issues or need further assistance with filtering Redeem Records, feel free to let me know!",
  "What statuses are available for filtering Redeem Records?":
    "You can filter Redeem Records by the following statuses: - Failed - Pending Approval - Rejected - Redeem Successfully - Expired - Failed Transaction Is there anything else you would like to know about Redeem Records or any other feature of the Agent section?",

  // Export Redeems
  "How can I export Redeem Records in PDF or Excel format?":
    "To export Redeem Records in PDF or Excel format, you can follow these steps in the GETWAYS Master Agent section: 1. Go to the Redeem Records tab. 2. Filter the records as needed by Account and Status. 3. Look for an option to export the data, usually located near the list of records. 4. Choose the format you prefer - PDF or Excel. 5. Click on the export option to generate and download the file. If you encounter any issues or need further assistance, feel free to ask!",
  "What data is included in the exported Redeem Records?":
    "When you export Redeem Records, the data included typically consists of information such as Account details, Redeem Status, and any other relevant details related to the redemption transactions. Would you like more details or assistance with anything else related to the website?",

  // View Summary
  "What information is included in the Summary section?":
    "In the Summary section, you can view the following information with date-wise filtering: - Total number of users - Total Agents - Total Recharges - Total Redeems - Pending Recharges - Failed Redeems You can also search for specific Agents or Players under you by name in the Summary section.",
  "How can I view the total number of users and Agents?":
    "To view the total number of users and Agents, you can access the Summary section in the Master Agent platform. In the Summary, you will find the total number of users, total Agents, as well as other details like total Recharges, total Redeems, pending Recharges, and failed Redeems. This section provides a detailed overview of the users and Agents under your management.",
  "How do I check total Recharges and Redeems?":
    "To check the total Recharges and Redeems, you can access the Summary section in the Master Agent dashboard. In the Summary, you will find the following details: - Total number of users - Total Agents - Total Recharges - Total Redeems - Pending Recharges - Failed Redeems By viewing this summary, you can easily track and monitor the total Recharges and Redeems for the Agents and Players under you.",

  // Filter Summary
  "How can I filter the Summary by date?":
    "To filter the Summary by date, you can use the date-wise filtering option available in the Summary section of the Master Agent platform. This allows you to view a detailed summary based on specific dates. Simply enter the date range you want to filter by, and the Summary will display relevant information accordingly. If you need further assistance with this feature or have any other questions, feel free to ask!",
  "What date ranges are available for filtering the Summary?":
    "In the Summary section, you can filter by specific dates to view a detailed summary. The available date ranges for filtering include: - All Time - Today - Yesterday - This Week - Last Week - This Month - Last Month You can choose any of these date ranges to get a summary for that specific period. Is there anything else you would like to know?",

  // Search Users
  "How do I search for a specific Agent or Player in the Summary?":
    "To search for a specific Agent or Player in the Summary section, you can use the search bar provided. Simply enter the name of the Agent or Player you are looking for, and the system will filter the results based on your search query. This way, you can easily find and access the information you need about a particular Agent or Player within the Summary section.",
  "What details can I see for searched users in the Summary?":
    "In the Summary section, when you search for specific Agents or Players under you, you can see details such as: - Total number of users - Total Agents - Total Recharges - Total Redeems - Pending Recharges - Failed Redeems These details provide you with a comprehensive overview of the activities and status of the users you are managing.",

  // Change Password
  "How do I change my Master Agent account password?":
    "To change your Master Agent account password, you can follow these steps: 1. Click on the profile icon in the top right corner of the Master Agent section. 2. Select the Change Password option. 3. A popup will appear where you can enter your current password and then set a new password. 4. Confirm the new password and save the changes. That's it! Your Master Agent account password will be successfully changed. If you need any more help, feel free to ask.",
  "What should I do if I encounter issues changing my password?":
    "If you encounter any issues while trying to change your password as a Master Agent, I recommend the following steps: 1. Double-check the current password you are entering to ensure it is correct. 2. Make sure the new password meets the required criteria, such as minimum length or special character requirements. 3. If you are still unable to change your password, try refreshing the page or logging out and logging back in to see if it resolves the issue. 4. If the problem persists, you can contact the support team for further assistance or troubleshooting. By following these steps, you should be able to resolve any issues you encounter while changing your password.",

  // Recharge Limit
  "How do I set Recharge Limits for Agents and Players?":
    "To set Recharge Limits for Agents and Players as a Master Agent on the GETWAYS platform, follow these steps: 1. Log in to your Master Agent account. 2. Go to the Profile Options by clicking on the profile icon in the top right corner. 3. Select Recharge Limit from the options. 4. A popup will appear where you can set monthly and daily recharge limits for both Agents and Players under you. 5. Enter the desired limits and save the changes. Remember, setting recharge limits helps in managing and controlling the recharge activities of your Agents and Players effectively. If you have any more questions or need further assistance, feel free to ask!",
  "What are the minimum and maximum Recharge Limits I can set?":
    "As a Master Agent on the GETWAYS platform, you have the flexibility to set custom Recharge Limits for both Players and Agents under you. There is no fixed minimum or maximum limit defined, allowing you to adjust the limits based on your specific requirements and the needs of your users. Feel free to set limits that align with your business strategy and the financial capacities of your Agents and Players. If you require any assistance in setting these limits or have any other questions, feel free to ask!",

  // Help Videos
  "How can I access Help Videos for Login and Sign Up processes?":
    "To access Help Videos for the Login and Sign Up processes, you can click on the profile icon in the top right corner of the Master Agent section. Then, select Help Videos from the options available. This will allow you to watch videos that provide guidance on the Login and Sign Up procedures. If you have any more questions or need further assistance, feel free to ask!",
  "What topics are covered in the Help Videos?":
    "The Help Videos cover topics related to the Login and Sign Up processes on the platform. You can watch these videos to learn how to navigate through these processes effectively. If you have any specific questions about the videos or need further assistance, feel free to ask!",

  // Logout
  "How do I log out of my Master Agent account?":
    "To log out of your Master Agent account, you can click on the profile icon located in the top right corner of the page. From there, you will see the option to Logout. Simply click on that option to successfully log out of your account.",
  "What happens to my session after logging out?":
    "When you log out of your Master Agent account, your session will be terminated. This means you will be logged out of the platform and any active session will be ended. To access your account again, you will need to log in with your credentials. If you have any more questions or need further assistance, feel free to ask!",

  // Balance
  "How is the Master Agent Balance calculated?":
    "The Master Agent Balance is calculated by summing up the balances of all Agents under the Master Agent and all Players under those Agents. The displayed balance reflects the combined balance of all users under the Master Agent's hierarchy.",
  "Why does my balance reflect the combined balance of Agents and Players?":
    "The balance displayed in your profile reflects the combined balance of all Agents under you and all Players under those Agents. This allows you, as a Master Agent, to have an overview of the total funds available within your network. It helps you manage and monitor the financial activities of all users under your supervision efficiently. If you have any more questions or need further clarification, feel free to ask!",
  "How can I view my current balance?":
    "As a Master Agent, you can view your current balance near the top right corner of the page. The balance displayed reflects the combined balance of all Agents under you and all Players under those Agents. If you need any further assistance, feel free to ask!",
};

export const agentMainOptions = [
  { id: "user-management", label: "User Management", icon: "👥" },
  { id: "recharge-records", label: "Recharge Records", icon: "💰" },
  { id: "redeem-records", label: "Redeem Records", icon: "🎁" },
  { id: "summary", label: "Summary", icon: "📊" },
  { id: "profile", label: "Profile Options", icon: "👤" },
  { id: "other", label: "Other", icon: "🤷‍♂️" },
];

export const agentSubOptions = {
  "user-management": [
    { id: "view-players", label: "View Players", icon: "📋" },
    { id: "add-player", label: "Add New Player", icon: "➕" },
    { id: "referral-link", label: "Create Referral Link", icon: "🔗" },
    { id: "player-actions", label: "Player Actions", icon: "⚙️" },
    { id: "filter-players", label: "Filter Players", icon: "🔍" },
  ],
  "recharge-records": [
    { id: "view-recharges", label: "View Recharge Records", icon: "📜" },
    { id: "filter-recharges", label: "Filter Recharges", icon: "🔍" },
    { id: "export-recharges", label: "Export Recharge Data", icon: "📤" },
  ],
  "redeem-records": [
    { id: "view-redeems", label: "View Redeem Records", icon: "📜" },
    { id: "filter-redeems", label: "Filter Redeems", icon: "🔍" },
    { id: "export-redeems", label: "Export Redeem Data", icon: "📤" },
  ],
  summary: [
    { id: "view-summary", label: "View Summary", icon: "📊" },
    { id: "filter-summary", label: "Filter by Date", icon: "📅" },
    { id: "search-players", label: "Search Players", icon: "🔍" },
  ],
  profile: [
    { id: "change-password", label: "Change Password", icon: "🔑" },
    { id: "recharge-limit", label: "Set Recharge Limits", icon: "⚖️" },
    { id: "help-videos", label: "Help Videos", icon: "🎥" },
    { id: "logout", label: "Logout", icon: "🚪" },
    { id: "balance", label: "View Balance", icon: "💸" },
  ],
};

export const agentFinalOptions = {
  "view-players": [
    "How can I view the list of Players under me?",
    "What details are shown in the User Management table for Players?",
    "How do I check the Parent User of a Player?",
  ],
  "add-player": [
    "How do I create a new Player using the 'Add New User' option?",
    "What information is required to add a new Player?",
    "Are there any restrictions when adding a new Player?",
  ],
  "referral-link": [
    "How do I create a referral link for Players?",
    "How can Players use my referral link to sign up?",
  ],
  "player-actions": [
    "How do I perform a recharge for a Player?",
    "How can I redeem funds for a Player?",
    "How do I view a Player's wallet details?",
    "How can I copy a Player's wallet address?",
    "How do I access BaseScan or EtherScan for a Player's transactions?",
    "How can I edit or delete a Player's details?",
  ],
  "filter-players": [
    "How can I filter Players by Email or Username?",
    "What filters are available in the User Management section?",
  ],
  "view-recharges": [
    "How can I view all Recharge Records for Players under me?",
    "What details are included in the Recharge Records list?",
  ],
  "filter-recharges": [
    "How do I filter Recharge Records by Account, Status, or Mode?",
    "What statuses can I filter Recharge Records by?",
  ],
  "export-recharges": [
    "How can I export Recharge Records in PDF or Excel format?",
    "What data is included in the exported Recharge Records?",
  ],
  "view-redeems": [
    "How can I view all Redeem Records for Players under me?",
    "What information is shown in the Redeem Records list?",
  ],
  "filter-redeems": [
    "How do I filter Redeem Records by Account or Status?",
    "What statuses are available for filtering Redeem Records?",
  ],
  "export-redeems": [
    "How can I export Redeem Records in PDF or Excel format?",
    "What data is included in the exported Redeem Records?",
  ],
  "view-summary": [
    "What information is included in the Summary section?",
    "How can I view the total number of Players and transactions?",
    "How do I check total Recharges and Redeems?",
  ],
  "filter-summary": [
    "How can I filter the Summary by date?",
    "What date ranges are available for filtering the Summary?",
  ],
  "search-players": [
    "How do I search for a specific Player in the Summary?",
    "What details can I see for searched Players in the Summary?",
  ],
  "change-password": [
    "How do I change my Agent account password?",
    "What should I do if I encounter issues changing my password?",
  ],
  "recharge-limit": [
    "How do I set Recharge Limits for Players under me?",
    "What are the minimum and maximum Recharge Limits I can set?",
  ],
  "help-videos": [
    "How can I access Help Videos for Login and Sign Up processes?",
    "What topics are covered in the Help Videos?",
  ],
  logout: [
    "How do I log out of my Agent account?",
    "What happens to my session after logging out?",
  ],
  balance: ["How can I view my current balance?"],
};

export const agentFinalAnswers = {
  // View Players
  "How can I view the list of Players under me?":
    "To view the list of Players under you, you can access the User Management section in the Agent dashboard. There, you will find a list of Players that includes details such as User Name, Email, Parent User, User Type, and Date. You can click on the Actions button in the table to perform various actions like Redeem, Recharge, view Wallet Details, copy Wallet Address, access transaction details, edit player details, or delete player details. Is there anything specific you would like to know about viewing Players under you?",
  "What details are shown in the User Management table for Players?":
    "In the User Management table for Players, the following details are typically shown: - User Name - Email - Parent User - User Type - Date Additionally, you can perform various actions for each Player by clicking the Actions button in the table. These actions include Redeem, Recharge, Wallet, View Key, BaseScan, EtherScan, Edit, and Delete.",
  "How do I check the Parent User of a Player?":
    "To check the Parent User of a Player, you can access the User Management section in the Agent dashboard. From there, you can view a list of Players under you, including User Name, Email, Parent User, User Type, and Date. The Parent User column will display the Agent who is the direct parent of each Player. If you need more detailed information or assistance with this, feel free to ask!",

  // Add Player
  "How do I create a new Player using the 'Add New User' option?":
    "To create a new Player using the 'Add New User' option in the User Management section of the Agent platform, you can follow these steps: 1. Navigate to the User Management section. 2. Look for the 'Add New User' option. 3. Click on 'Add New User' to create a new Player. 4. Fill in the required details such as User Name, Email, Parent User (Agent), User Type, and Date. 5. Once you have entered the necessary information, save the new Player profile. 6. The new Player will now be successfully created and linked to you as their Parent User (Agent). If you need further assistance or have any more questions, feel free to ask!",
  "What information is required to add a new Player?":
    "When adding a new Player, the following information is required to be filled out: - Username - Name - Phone Number - Email - Password - Confirm Password Is there anything else you would like to know about adding a new Player?",
  "Are there any restrictions when adding a new Player?":
    "When adding a new Player in the GETWAYS Agent section, there are certain required fields that must be filled out. These fields include: - Username - Name - Phone Number - Email - Password - Confirm Password Ensuring that all these fields are properly filled out is essential when creating a new Player. If any of these required fields are left blank or not filled out correctly, it may hinder the successful creation of the new Player.",

  // Referral Link
  "How do I create a referral link for Players?":
    "To create a referral link for Players, you can follow these steps: 1. Log in to the Agent section of the GETWAYS platform. 2. Navigate to the User Management tab. 3. Click on the Add New User option. 4. Fill in the required fields for the new Player, including Username, Name, Phone Number, Email, Password, and Confirm Password. 5. Once the Player is created, you can find the referral link associated with that Player. 6. Share this referral link with potential Players for them to sign up and be linked to you as the Agent. If you need further assistance or have any other questions, feel free to ask!",
  "How can Players use my referral link to sign up?":
    "Players can use your referral link to sign up by following these steps: 1. You, as an Agent, generate a referral link from your Agent account. 2. Share this referral link with potential Players. 3. When a Player clicks on the referral link, they will be directed to the sign-up page with your Agent information pre-filled. 4. The Player can then complete the sign-up process by entering their details and creating an account. 5. Once the Player successfully signs up using your referral link, they will be linked to your Agent account, and you can start managing them within your dashboard. This way, Players can easily sign up and be associated with you as their Agent. If you have any more questions or need further clarification, feel free",

  // Player Actions
  "How do I perform a recharge for a Player?":
    "To perform a recharge for a Player, follow these steps: 1. Go to the User Management section. 2. Locate the Player for whom you want to recharge. 3. Click on the Actions button in the table next to the Player's details. 4. Select the Recharge option. 5. Enter the necessary recharge details such as the amount to be recharged and any remarks if needed. 6. Submit the recharge request. 7. If the recharge status is Pending Confirmation, you'll need to copy the recharge confirmation URL and manually confirm the recharge for the Player. 8. If the status is Confirmed, you can click on the Coin Credit button to credit the coins to the Player. If you have any",
  "How can I redeem funds for a Player?":
    "To redeem funds for a Player, follow these steps: 1. Go to the User Management section. 2. Find the specific Player you want to redeem funds for. 3. Click on the Actions button in the table for that Player. 4. Select the Redeem option. 5. Follow the on-screen prompts to complete the redemption process for the Player. If you encounter any issues or need further assistance, feel free to ask!",
  "How do I view a Player's wallet details?":
    "To view a Player's wallet details, you can access the Wallet option for that specific Player. This will allow you to see the available balance, payment methods, cashout status, and other relevant information related to the Player's wallet. If you need more details or have any other questions, feel free to ask!",
  "How can I copy a Player's wallet address?":
    "To copy a Player's wallet address, you can access the Player's profile and click on the View Key option. This will allow you to copy the wallet address associated with that player. If you have any more questions or need further assistance, feel free to ask!",
  "How do I access BaseScan or EtherScan for a Player's transactions?":
    "To access BaseScan or EtherScan for a Player's transactions, you can click on the BaseScan or EtherScan option under the Actions menu for that specific Player. This will allow you to view detailed transaction information related to that Player. Let me know if you need any more details or assistance!",
  "How can I edit or delete a Player's details?":
    "To edit or delete a Player's details in the Agent section, you can follow these steps: 1. Go to the User Management tab. 2. Find the Player you want to edit or delete in the list. 3. Click on the Actions button for that specific Player. 4. From the dropdown menu, you can select either Edit to modify the Player's details or Delete to remove the Player from your list. By following these steps, you can easily edit or delete a Player's details as needed. Let me know if you need more help with this!",

  // Filter Players
  "How can I filter Players by Email or Username?":
    "To filter Players by Email or Username in the User Management section, you can use the search bar provided in the User Management interface. Simply enter the email or username you want to filter by, and the system will display the relevant Players matching your search criteria. Let me know if you need more assistance with this feature!",
  "What filters are available in the User Management section?":
    "In the User Management section, you can filter Players by Email and Username. This allows you to easily search for specific Players under your management. If you need more information or assistance with filtering Players, feel free to ask!",

  // View Recharges
  "How can I view all Recharge Records for Players under me?":
    "To view all Recharge Records for Players under you, you can access the Recharge Records section in the Agent area of the GETWAYS platform. Once there, you will see a list of all Recharge Records with columns such as Action, Accounts, Recharged, Remark, Status, Failed Reason, Parent, and Recharge Date. You can filter these records by Account, Status, and Mode. Additionally, you have the option to export the data in PDF and Excel formats for your convenience. If you have any specific questions or need further assistance, feel free to ask!",
  "What details are included in the Recharge Records list?":
    "The Recharge Records list includes the following details for each entry: - Action - Accounts - Recharged amount - Remark - Status - Failed Reason - Parent User - Recharge Date These details provide a comprehensive overview of each recharge transaction for Players under the Agent.",

  // Filter Recharges
  "How do I filter Recharge Records by Account, Status, or Mode?":
    "To filter Recharge Records by Account, Status, or Mode in the Agent section of GETWAYS platform, follow these steps: 1. Go to the Recharge Records section. 2. Look for the filter options available for filtering the records. 3. You can filter by: - Account: This allows you to filter recharge records based on the account used for the recharge. - Status: This helps you filter records based on the current status of the recharge (e.g., Pending Confirmation, Confirmed). - Mode: This enables you to filter records based on the mode of recharge. Simply select the desired filter criteria, and the system will display the Recharge Records that match your selected filters.",
  "What statuses can I filter Recharge Records by?":
    "You can filter Recharge Records by the following statuses: - Pending Referral - Pending Confirmation - Confirmed - Coin Credit - Expired - Failed Transaction Feel free to ask if you need more information or assistance!",

  // Export Recharges
  "How can I export Recharge Records in PDF or Excel format?":
    "To export Recharge Records in PDF or Excel format, follow these steps: 1. Go to the Recharge Records section in the Agent dashboard. 2. Use the filters to display the specific Recharge Records you want to export. 3. Look for an option or button that allows you to export the data. It should be labeled as Export or similar. 4. Click on the export option and choose the format you prefer: PDF or Excel. 5. The system will generate the export file with the Recharge Records in the selected format for you to download. If you encounter any issues or need further assistance, feel free to ask!",
  "What data is included in the exported Recharge Records?":
    "When you export Recharge Records, the following data is included in the exported file: - Action - Accounts - Recharged - Remark - Status - Failed Reason - Parent - Recharge Date This information helps Agents keep track of all recharge activities for Players under them.",

  // View Redeems
  "How can I view all Redeem Records for Players under me?":
    "To view all Redeem Records for Players under you, you can access the Redeem Records section in the Agent area of the platform. There, you will find a list of all the Redeem Records, including columns such as Action, Accounts, Redeemed, Remark, Status, Service Fee, Parent, and Redeem Date. You can also filter the records by Account and Status to easily find the information you need. Additionally, you have the option to export the data in PDF and Excel formats for further analysis or record-keeping. Let me know if you need more details or assistance with this feature!",
  "What information is shown in the Redeem Records list?":
    "In the Redeem Records list, you can view the following information for each redeem transaction: - Action: Approve or Reject - Accounts: Details of the account used for the redeem - Redeemed: Amount redeemed - Remark: Additional notes or comments - Status: Pending Approval, Approved, Rejected - Service Fee: Fee charged for the redeem - Parent: Referral link used, if any - Redeem Date: Date and time of the redeem transaction Feel free to ask if you need more details or have any other questions!",

  // Filter Redeems
  "How do I filter Redeem Records by Account or Status?":
    "To filter Redeem Records by Account or Status, you can use the filter options available in the Redeem Records section of the Agent platform. Simply click on the filter options for Account or Status, and then select the specific criteria you want to filter by. This will help you quickly find the Redeem Records that match your desired parameters. Let me know if you need more information!",
  "What statuses are available for filtering Redeem Records?":
    "You can filter Redeem Records by the following statuses: - Failed - Pending Approval - Rejected - Redeem Successfully - Expired - Failed Transaction Is there anything else you would like to know about Redeem Records or any other feature of the Agent section?",

  // Export Redeems
  "How can I export Redeem Records in PDF or Excel format?":
    "To export Redeem Records in PDF or Excel format, you can follow these steps: 1. Go to the Redeem Records section in the Agent dashboard. 2. Apply any filters you need to refine the list of Redeem Records. 3. Look for an Export button or option on the page. 4. Click on the Export button and select the format you prefer (PDF or Excel). 5. The system will generate the file for you to download with all the Redeem Records in the chosen format. If you encounter any issues or need further assistance, feel free to ask!",
  "What data is included in the exported Redeem Records?":
    "When you export Redeem Records data, the following information is included in the export file: - Action - Accounts - Redeemed - Remark - Status - Service Fee - Parent - Redeem Date Is there anything else you would like to know about the Redeem Records or any other feature on the platform?",

  // View Summary
  "What information is included in the Summary section?":
    "In the Summary section, you can view the following information: - Total number of users - Total Recharges - Total Redeems - Pending Recharges - Failed Redeems Is there anything else you would like to know about the Summary section?",
  "How can I view the total number of Players and transactions?":
    "To view the total number of Players and transactions, you can access the Summary section in the Agent dashboard. In the Summary, you will find details such as the total number of users, total recharges, total redeems, pending recharges, and failed redeems. Simply filter the summary by date or search for specific Players to get an overview of the transactions and the number of Players under your management.",
  "How do I check total Recharges and Redeems?":
    "To check the total Recharges and Redeems, you can access the Summary section. The Summary provides you with an overview of the total number of users, total Recharges, total Redeems, pending Recharges, and failed Redeems. You can filter this information by date and search for specific Players under your account by name. If you need more detailed information or assistance, feel free to ask!",

  // Filter Summary
  "How can I filter the Summary by date?":
    "In the Summary section, you can filter the information by date. Simply select the date range you want to view, and the summary will update to show the relevant data within that timeframe. If you have any other questions or need further assistance, feel free to ask!",
  "What date ranges are available for filtering the Summary?":
    "In the Summary section, you can filter by specific dates to view a detailed summary. The available date ranges for filtering include: - All Time - Today - Yesterday - This Week - Last Week - This Month - Last Month You can choose any of these date ranges to get a summary for that specific period. Is there anything else you would like to know?",

  // Search Players
  "How do I search for a specific Player in the Summary?":
    "To search for a specific Player in the Summary section, you can enter the Player's name in the search bar provided. This will filter the results to show only the Player you are looking for. Is there anything else you would like to know about searching for Players in the Summary?",
  "What details can I see for searched Players in the Summary?":
    "In the Summary section, you can view the following details for searched Players under you: - Total number of users - Total Recharges - Total Redeems - Pending Recharges - Failed Redeems Is there anything else you would like to know about the Summary section or Players' details?",

  // Change Password
  "How do I change my Agent account password?":
    "To change your Agent account password, you can follow these steps: 1. Click on the profile icon in the top right corner of the GETWAYS platform. 2. Select Change Password from the options. 3. A popup will appear where you can enter your current password and then set a new password. 4. Once you've entered the required information, click on the appropriate button to confirm the password change.",
  "What should I do if I encounter issues changing my password?":
    "If you encounter any issues while changing your password on the GETWAYS platform, you can try the following steps: 1. **Check your Internet Connection**: Ensure you have a stable internet connection before attempting to change your password. 2. **Browser Compatibility**: Make sure you are using a compatible browser to access the platform. Recommended browsers include Chrome, Firefox, Safari, or Edge. 3. **Clear Browser Cache**: Clear your browser cache and cookies as this can sometimes cause issues with website functionality. 4. **Contact Support**: If the issue persists, you can reach out to the platform's support team for assistance. They can provide further guidance on resolving password change issues. If you need more specific assistance or guidance, feel free to provide additional",

  // Recharge Limit
  "How do I set Recharge Limits for Players under me?":
    "To set Recharge Limits for Players under you in the GETWAYS Agent section, follow these steps: 1. Log in to your Agent account. 2. Click on the profile icon in the top right corner. 3. Select Recharge Limit from the options. 4. A popup will appear where you can set the desired recharge limit for your Players. 5. Enter the recharge limit value you wish to set. 6. Click on the Save or Confirm button to save the recharge limit for your Players. By following these steps, you can easily set recharge limits for the Players under your management on the platform. If you need further assistance, feel free to ask!",
  "What are the minimum and maximum Recharge Limits I can set?":
    "The minimum and maximum Recharge Limits that you can set for Players under you can be customized based on your requirements. There are no predefined standard values for the limits, allowing you the flexibility to adjust them as needed. Feel free to set the Recharge Limits according to your preferences and the needs of your Players. If you have specific values in mind or need further assistance with setting the limits, please let me know!",

  // Help Videos
  "How can I access Help Videos for Login and Sign Up processes?":
    "To access Help Videos for Login and Sign Up processes, you can click on the profile icon in the top right corner of the Agent section. From there, you will find an option to watch Help Videos. Simply select that option to view the videos and learn more about the Login and Sign Up processes.",
  "What topics are covered in the Help Videos?":
    "The Help Videos cover topics related to the Login and Sign Up processes. They provide step-by-step guidance on how to navigate through these essential processes on the GETWAYS platform. If you need more details or assistance with the Help Videos, feel free to ask!",

  // Logout
  "How do I log out of my Agent account?":
    "To log out of your Agent account, you can click on the profile icon in the top right corner of the screen. From there, you will see the option to Logout. Simply click on Logout to successfully log out of your Agent account.",
  "What happens to my session after logging out?":
    "After logging out, your session will be terminated, and you will be redirected to the login page. This ensures that your account remains secure and that you need to log back in to access the Agent section of the GETWAYS platform.",

  // Balance
  "How can I view my current balance?":
    "To view your current balance as an Agent on the platform, you can check the top right corner near the Profile icon. The balance displayed reflects the combined balance of all Players under your account. If you need any more assistance, feel free to ask!",
};

export const superUserMainOptions = [
  { id: "user-management", label: "User Management", icon: "👥" },
  { id: "recharge-records", label: "Recharge Records", icon: "💰" },
  { id: "redeem-records", label: "Redeem Records", icon: "🎁" },
  { id: "summary", label: "Summary", icon: "📊" },
  { id: "reports", label: "Reports", icon: "📈" },
  { id: "kyc", label: "KYC Management", icon: "🛡️" },
  { id: "giftcard", label: "Gift Card", icon: "💌" },
  { id: "walletaudit", label: "Wallet Audit", icon: "💼" },
  { id: "profile", label: "Profile Options", icon: "👤" },
  { id: "other", label: "Other", icon: "🤷‍♂️" },
];

export const superUserSubOptions = {
  "user-management": [
    { id: "view-users", label: "View Users", icon: "📋" },
    { id: "add-user", label: "Add New User", icon: "➕" },
    { id: "agent-actions", label: "Agent & Master Agent Actions", icon: "⚙️" },
    { id: "player-actions", label: "Player Actions", icon: "🎮" },
    { id: "filter-users", label: "Filter Users", icon: "🔍" },
  ],
  "recharge-records": [
    { id: "view-recharges", label: "View Recharge Records", icon: "📜" },
    { id: "filter-recharges", label: "Filter Recharges", icon: "🔍" },
    { id: "export-recharges", label: "Export Recharge Data", icon: "📤" },
    { id: "recharge-actions", label: "Recharge Actions", icon: "🛠️" },
  ],
  "redeem-records": [
    { id: "view-redeems", label: "View Redeem Records", icon: "📜" },
    { id: "filter-redeems", label: "Filter Redeems", icon: "🔍" },
    { id: "export-redeems", label: "Export Redeem Data", icon: "📤" },
    { id: "redeem-actions", label: "Redeem Actions", icon: "🛠️" },
  ],
  summary: [
    { id: "view-summary", label: "View Summary", icon: "📊" },
    { id: "filter-summary", label: "Filter by Date", icon: "📅" },
    { id: "search-users", label: "Search Users", icon: "🔍" },
    { id: "export-reports", label: "Export Reports", icon: "📤" },
  ],
  reports: [
    { id: "overview-report", label: "Overview Report", icon: "📊" },
    { id: "comparison-report", label: "Comparison Report", icon: "📉" },
    { id: "agent-overview", label: "Agent Overview", icon: "👤" },
    { id: "player-overview", label: "Player Overview", icon: "🎮" },
    { id: "player-comparison", label: "Player Comparison", icon: "⚖️" },
    { id: "particular-player", label: "Particular Player Report", icon: "🔍" },
    { id: "kyc-report", label: "KYC Report", icon: "🛡️" },
    { id: "transaction-export", label: "Transaction Export", icon: "📤" },
  ],
  kyc: [
    { id: "view-kyc", label: "View KYC Records", icon: "📋" },
    { id: "filter-kyc", label: "Filter KYC Records", icon: "🔍" },
    { id: "export-kyc", label: "Export KYC Report", icon: "📤" },
  ],
  giftcard: [
    { id: "view-gift-cards", label: "View Gift Card Transactions", icon: "📜" },
    { id: "search-giftcard", label: "Search", icon: "🔍" },
    { id: "filter-status", label: "Filter by Status", icon: "📅" },
  ],
  walletaudit: [
    { id: "view-wallet-audit", label: "View Wallet Audit Report", icon: "📊" },
    { id: "search-walletaudit", label: "Search", icon: "🔍" },
    { id: "export-data", label: "Export Data", icon: "📤" },
    { id: "filter-mode", label: "Filter by Mode", icon: "📅" },
  ],
  profile: [
    { id: "global-settings", label: "Global Recharge & Cashout", icon: "🌐" },
    { id: "payment-methods", label: "Manage Payment Methods", icon: "💳" },
    { id: "emergency-messages", label: "Emergency Messages", icon: "📢" },
    { id: "help-videos", label: "Help Videos", icon: "🎥" },
    { id: "logout", label: "Logout", icon: "🚪" },
  ],
};

export const superUserFinalOptions = {
  "view-users": [
    "How can I view the list of all users in the system?",
    "What details are shown in the User Management table?",
    "How do I check the User Type or Parent User of a user?",
  ],
  "add-user": [
    "How do I create a new user using the 'Add New User' option?",
    "What fields are required to add a new user?",
    "Can I assign a Super-User as a Parent Type for a new user?",
  ],
  "agent-actions": [
    "How can I disable recharge for an Agent or Master Agent?",
    "How do I set daily and monthly recharge limits for an Agent?",
    "How can I set the Redeem Service Fee for an Agent?",
    "How do I allow an Agent to reset their Players' passwords?",
    "What does the 'Drawer' action do for an Agent?",
    "How can I edit or delete an Agent’s details?",
  ],
  "player-actions": [
    "How do I perform a recharge for a Player?",
    "How can I redeem funds for a Player?",
    "How do I view a Player’s wallet details?",
    "How can I copy a Player’s wallet address?",
    "How do I access BaseScan or EtherScan for a Player’s transactions?",
    "How can I edit or delete a Player’s details?",
    "How do I blacklist a Player?",
  ],
  "filter-users": [
    "How can I filter users by Username, Email, or Parent Name?",
    "How do I filter users by Role (Player, Agent, Master Agent, Super-User)?",
  ],
  "view-recharges": [
    "How can I view all Recharge Records for users?",
    "What details are included in the Recharge Records table?",
  ],
  "filter-recharges": [
    "How do I filter Recharge Records by Account, Status, or Mode?",
    "What statuses and modes are available for filtering Recharge Records?",
  ],
  "export-recharges": [
    "How can I export Recharge Records in PDF or Excel format?",
    "What data is included in the exported Recharge Records?",
  ],
  "recharge-actions": [
    "How do I copy the recharge confirmation URL for a Pending Confirmation status?",
    "How can I credit coins to a Player for a Confirmed recharge?",
  ],
  "view-redeems": [
    "How can I view all Redeem Records for Players?",
    "What details are shown in the Redeem Records table?",
  ],
  "filter-redeems": [
    "How do I filter Redeem Records by Account or Status?",
    "What statuses are available for filtering Redeem Records?",
  ],
  "export-redeems": [
    "How can I export Redeem Records in PDF or Excel format?",
    "What data is included in the exported Redeem Records?",
  ],
  "redeem-actions": [
    "How do I approve or reject a Pending Approval redeem request?",
    "How can I confirm or reject a Cashout request for a Player?",
    "How do I reject a Cashout Successfully or Undone Cashout with a remark?",
  ],
  "view-summary": [
    "What metrics are included in the Summary page?",
    "How can I view the total number of users, recharges, or redeems?",
    "What does the Total Wallet Balance represent?",
  ],
  "filter-summary": [
    "How do I filter the Summary by Start Date and End Date?",
    "How can I filter Total Recharge by Wallet, Others, or All?",
  ],
  "search-users": [
    "How do I search for a specific Master Agent, Agent, or Player in the Summary?",
    "What details are shown for searched users in the Summary?",
  ],
  "export-reports": [
    "How do I generate month-wise PDF or Excel reports for Recharge and Redeem?",
    "What data is included in the exported reports?",
  ],
  "overview-report": [
    "What data is shown in the Overview Report?",
    "How do I generate the Agent Overall Report in PDF format?",
    "What does the Transaction Overview Pie Chart represent?",
  ],
  "comparison-report": [
    "How do I compare data between two dates, months, or years?",
    "What do the Data Comparison Bar Charts for Recharge, Redeem, and Cashout show?",
  ],
  "agent-overview": [
    "How do I analyze an Agent’s transactions in the Agent Overview?",
    "What does the Total Transaction Summary Pie Chart show for an Agent?",
    "How is the Daily Transactions Line Chart generated?",
  ],
  "player-overview": [
    "How do I view transactional analysis for all Players?",
    "How can I filter Player data by Agent name?",
    "What does the Players Transaction Overview Bar Chart represent?",
  ],
  "player-comparison": [
    "How do I compare Player transaction data between two dates or months?",
    "How can I filter Player Comparison data to show top 5, 10, or 20 Players?",
    "What does the Data Comparison for Recharge show for a specific Player?",
  ],
  "particular-player": [
    "How do I analyze transactions for a specific Player?",
    "What does the Total Transaction Summary Pie Chart show for a Player?",
    "How is the Daily Player Transactions Line Chart generated?",
  ],
  "kyc-report": [
    "How do I view the KYC Status Overview Pie Chart?",
    "What do the colors in the KYC Status Pie Chart represent?",
    "How can I generate a PDF report for KYC records?",
  ],
  "transaction-export": [
    "How do I generate an Excel report for transaction data?",
    "What columns are included in the Transaction Export Excel report?",
    "Can I specify a time period for the Transaction Export?",
  ],
  "view-kyc": [
    "How do I view all KYC Records in the KYC Records Page?",
    "What details are shown in the KYC Records table?",
  ],
  "filter-kyc": [
    "How do I filter KYC Records by Email or Parent Name?",
    "How can I filter KYC Records by Status (Success, Pending, Failed, Expired)?",
  ],
  "export-kyc": [
    "How do I generate a PDF report for KYC Records?",
    "What data is included in the exported KYC Records report?",
  ],
  "view-gift-cards": [
    "How can I view all Gift Card Transactions?",
    "What details are shown in the Gift Card Transactions table?",
  ],
  "search-giftcard": ["How do I search for Gift Card Transactions?"],
  "filter-status": [
    "How can I filter Gift Card Transactions by Status?",
    "What does each status represent in the Gift Card Transactions table?",
  ],
  "view-wallet-audit": [
    "How can I view the Wallet Audit Report?",
    "What details are shown in the Wallet Audit Report table?",
  ],
  "search-walletaudit": ["How do I search for Wallet Audit transactions?"],
  "export-data": ["How can I export the Wallet Audit Report data?"],
  "filter-mode": [
    "How can I filter Wallet Audit transactions by Mode?",
    "What does each mode represent in the Wallet Audit transactions modal?",
  ],
  "global-settings": [
    "How do I enable or disable Recharge globally for all users?",
    "How can I enable or disable Cashout globally for all users?",
    "What happens if I disable Recharge for a specific Agent?",
  ],
  "payment-methods": [
    "How do I enable or disable a payment method like CashApp or PayPal?",
    "What payment methods are available to manage?",
  ],
  "emergency-messages": [
    "How do I compose and send emergency messages to Agents and Master Agents?",
    "Can I send multiple emergency messages at once?",
  ],
  "help-videos": [
    "How can I access Help Videos for Login and Sign-Up processes?",
    "What topics are covered in the Help Videos?",
  ],
  logout: [
    "How do I log out of my Super-User account?",
    "What happens to my session after logging out?",
  ],
};

export const superUserFinalAnswers = {
  // view-users
  "How can I view the list of all users in the system?": `To view the list of all users in the system, you can access the User Management section. Within this section, there should be an option to view and manage a list of all users. The list typically includes columns for User Name, Email, Parent User, User Type (Player, Agent, Master Agent, Super-User), and Date. You can filter users by criteria such as Username, Email, or Parent Name, as well as by Role (Player, Agents, Master Agents, or Super User). Feel free to explore the user list for more details and options.`,
  "What details are shown in the User Management table?": `In the User Management table, the following details are shown for each user: - User Name - Email - Parent User - User Type (Player, Agent, Master Agent, Super-User) - Date If you need more specific information or have any other questions related to user management, feel free to ask!`,
  "How do I check the User Type or Parent User of a user?": `To check the User Type or Parent User of a user, you can view the details in the user management section of the website. When you view the list of users, the columns displayed typically include User Name, Email, Parent User, User Type (Player, Agent, Master Agent, Super-User), and Date. By looking at these columns, you can easily identify the User Type and Parent User associated with each user in the system. If you need more specific details or assistance with this process, feel free to ask!`,

  // add-user
  "How do I create a new user using the 'Add New User' option?": `To create a new user using the Add New User option, follow these steps: 1. Click on the Add New User option on the User Management page. 2. A dialog will open with the following fields to fill out: - Name - Username - Phone Number - Email - User Type (options: Master Agent, Agent, Player) - Parent Type (options: Agents, Master Agents, Super User) - Password - Confirm Password 3. Fill in all the required information for the new user. 4. Click on the Save or Create User button to finalize the process. 5. The new user will be added to the system with the provided`,
  "What fields are required to add a new user?": `To add a new user, you need to fill out the following required fields: - Name - Username - Phone Number - Email - User Type (options: Master Agent, Agent, Player) - Parent Type (options: Agents, Master Agents, Super User) - Password - Confirm Password Make sure to provide accurate information in these fields to successfully create a new user. If you have any more questions or need further assistance, feel free to ask!`,
  "Can I assign a Super-User as a Parent Type for a new user?": `Yes, when adding a new user, you can assign a Super-User as the Parent Type. The Parent Type options available are Agents, Master Agents, and Super User. This allows for a hierarchical structure where a Super User can act as a parent for other users within the system. If you have any more questions or need further assistance, feel free to ask!`,

  // agent-actions
  "How can I disable recharge for an Agent or Master Agent?": `To disable recharge for an Agent or Master Agent, follow these steps: 1. Find the Agent or Master Agent in the list of users. 2. Click on the Actions button next to the user you want to disable recharge for. 3. Select the Disable Recharge option. 4. A dialog box will appear with the message Are you sure you want to disable recharge for user?. 5. Click on the Disable button to confirm the action or Cancel to go back. By following these steps, you can successfully disable recharge for an Agent or Master Agent in the system.`,
  "How do I set daily and monthly recharge limits for an Agent?":
    "To set daily and monthly recharge limits for an Agent, follow these steps: 1. Access the Agent or Master Agent section in the system. 2. Locate the specific Agent for whom you want to set the recharge limits. 3. Click on the **Recharge Limit** option for that Agent. 4. In the dialog that opens, you will find a toggle to enable/disable Recharge Limit Restriction. 5. If enabled, input the desired values for the Monthly Recharge Limit and Daily Recharge Limit. 6. Click on the **Save** button to apply the changes or **Cancel** to discard them. By following these steps, you can successfully set daily and monthly recharge limits for an Agent in the system.",
  "How can I set the Redeem Service Fee for an Agent?": `To set the Redeem Service Fee for an Agent, follow these steps: 1. Access the Agent's profile or details within the User Management section. 2. Look for the option related to Redeem Service Fee. 3. You should see toggles for **Allow Agent to change Redeem Service?** and **Allow Agent to Add 0 Redeem Service?** - adjust these toggles as needed. 4. Once you have set the desired options, click on the **Confirm** button to save the changes. 5. If you want to cancel without saving changes, click on the **Cancel** button. If you encounter any issues or need further assistance, feel free to ask!`,
  "How do I allow an Agent to reset their Players' passwords?": `To allow an Agent to reset their Players' passwords, you can follow these steps: 1. Go to the User Management section and locate the specific Agent you want to grant this permission to. 2. Click on the **Actions** button for that Agent. 3. Look for the **Password Permission** option in the available actions. 4. In the dialog that opens, you will find a checkbox for **Allow the Agent to set or reset their Player's password.** 5. Check the box to grant the Agent permission to reset their Players' passwords. 6. Click on the **Save Changes** button to confirm the permission. By following these steps, you will successfully allow the Agent to set or reset their Players' passwords. Let me know if you`,
  "What does the 'Drawer' action do for an Agent?": `The 'Drawer' action for an Agent typically refers to accessing and managing the Agent's drawer, which could involve functionalities related to financial transactions, account balances, or other financial aspects specific to that Agent's account. For detailed information on the specific actions and features available in the 'Drawer' function, I recommend referring to the platform's user manual or contacting the system administrator for more precise details.`,
  "How can I edit or delete an Agent’s details?": `To edit or delete an Agent's details, you can follow these steps: 1. Go to the User Management section in the Super-User area. 2. Look for the specific Agent you want to edit or delete in the list of users. 3. Click on the **Actions** button next to the Agent's details. 4. Select **Edit** to make changes to the Agent's Username, Name, and Email. Then click on the **Update** button to save the changes or **Cancel** to discard them. 5. To delete the Agent, click on the **Actions** button and choose **Delete.** 6. A dialog will prompt you to type **DELETE** to confirm the deletion. Once confirmed, click on the **Delete** button to proceed with deleting the Agent or **Cancel** to abort the operation. Following these steps will allow you to edit or delete an Agent's details in the system. If you need further assistance, feel free to ask!`,

  // player-actions
  "How do I perform a recharge for a Player?": `To perform a recharge for a Player, you can follow these steps: 1. Access the Player's profile in the User Management section. 2. Click on the **Actions** button for the specific Player. 3. Select the **Recharge** option from the available actions. 4. Follow the prompts to enter the recharge details, such as the amount, payment method, and any remarks. 5. Confirm the recharge to complete the process. If you encounter any issues or need further assistance, feel free to ask!`,
  "How can I redeem funds for a Player?": `To redeem funds for a Player, you can follow these steps: 1. Access the Player's details in the User Management section. 2. Click on the **Actions** button next to the Player's name. 3. Select the **Redeem** option from the available actions. 4. Depending on the Player's status, you may see options such as **Pending Approval** or **Cashout.** 5. If the status is **Pending Approval,** you can click on the ✅ (tick) button to approve the redemption request. 6. If the status is **Cashout,** you can click on the ✅ (tick) button to confirm the cashout for the Player. 7. Follow the on-screen prompts to complete the redemption process for the Player. If you encounter any specific issues or need further assistance, feel free to ask!`,
  "How do I view a Player’s wallet details?": `To view a Player's wallet details, you can follow these steps in the User Management section: 1. Access the list of Players. 2. Click on the **Actions** button next to the specific Player you want to view. 3. Select the **Wallet** option from the available actions. 4. This will display the Player's wallet details, including the available balance, payment methods, and cashout status. If you need further assistance or have any more questions, feel free to ask!`,
  "How can I copy a Player’s wallet address?": `To copy a Player's wallet address, you can use the **View Key** option under Player Actions. When you click on **View Key,** it will allow you to copy the Player's wallet address for further use. If you need more information or have any other questions, feel free to ask!`,
  "How do I access BaseScan or EtherScan for a Player’s transactions?": `To access BaseScan or EtherScan for a Player's transactions, you can follow these steps: 1. Click on the **Actions** button next to the Player's profile in the User Management section. 2. From the dropdown options, select either **BaseScan** or **EtherScan** based on the type of transaction details you want to view. 3. Once selected, you will be directed to the corresponding platform to access the detailed transaction information related to the Player. Feel free to ask if you need more assistance or information!`,
  "How can I edit or delete a Player’s details?": `To edit or delete a Player's details, you can follow these steps: 1. In the User Management section, locate the specific Player you want to edit or delete. 2. Click on the **Actions** button in the table next to the Player's details. 3. Select **Edit** to make changes to the Player's Username, Name, and Email. You can update the information as needed. 4. If you wish to delete the Player, choose the **Delete** option. 5. When selecting the **Delete** option, a dialog will prompt you to type **DELETE** to confirm the deletion. Follow the on-screen instructions to complete the deletion process. Please ensure that you have the necessary permissions to edit or delete a Player's details. Let me know if you need further assistance with Player actions.`,
  "How do I blacklist a Player?": `To blacklist a Player, you can follow these steps in the Super-User section of the platform: 1. Go to the User Management section. 2. Find and select the Player you want to blacklist. 3. Click on the **Actions** button next to the Player's name. 4. In the dropdown menu that appears, select the option to **Blacklist User.** 5. A dialog box will open with the message **Are you sure you want to blacklist the user? This action cannot be undone.** 6. Confirm your decision by clicking on the **Confirm** button to blacklist the Player. By following these steps, you'll be able to blacklist a Player in the system.`,

  // filter-users
  "How can I filter users by Username, Email, or Parent Name?": `To filter users by Username, Email, or Parent Name in the User Management section, you can use the search functionality provided: 1. Go to the User Management section on the GETWAYS platform. 2. Look for the search bar labeled **Search By** where you can select Username, Email, or Parent Name. 3. Choose the desired filter option (Username, Email, or Parent Name) from the dropdown menu. 4. Enter the specific Username, Email, or Parent Name you want to filter by in the search field. 5. The system will then display the users matching your search criteria, making it easier to find specific users based on the selected filter.`,
  "How do I filter users by Role (Player, Agent, Master Agent, Super-User)?": `To filter users by Role (Player, Agent, Master Agent, Super-User), you can follow these steps: 1. Go to the User Management section on the GETWAYS platform. 2. Look for the filter options available. 3. Select the **Role** filter. 4. Choose the role you want to filter by: Player, Agent, Master Agent, or Super-User. 5. The system will then display the users based on the role you selected. If you need more detailed instructions or have any other questions, feel free to ask!`,

  // view-recharges
  "How can I view all Recharge Records for users?": `To view all Recharge Records for users in the system, you can follow these steps: 1. Access the Recharge Records section in the Super-User interface. 2. You will see a list of all Recharge Records for Agents and Players under your supervision. 3. The columns in the Recharge Records table typically include details like Action, Accounts, Recharged, Remark, Status, Failed Reason, Transaction Confirmation Link, Parent, Mode, and Recharge Date. 4. Use the available filters such as Search By, Status, and Mode to narrow down your search. - Search By options: Account, Recharge, Remark, Parent Name. - Status options: Pending Referral, Pending Confirmation, Confirmed, Coin Credit, Expired, Failed Transaction. - Mode options: WERT, Link, Coinbase, AOG, Transfi, Wallet, Stripe. 5. You can export the data in PDF and Excel formats for further analysis or record-keeping`,
  "What details are included in the Recharge Records table?": `The Recharge Records table includes the following columns: - Action - Accounts - Recharged - Remark - Status - Failed Reason - Transaction Confirmation Link - Parent - Mode - Recharge Date These columns provide information about the recharges made by Agents and Players, allowing you to track and monitor the transaction details effectively.`,

  // filter-recharges
  "How do I filter Recharge Records by Account, Status, or Mode?": `To filter Recharge Records by Account, Status, or Mode, follow these steps: 1. **Account**: You can filter by Account by entering the Account details in the search bar provided. This will help you find specific Recharge Records associated with a particular account. 2. **Status**: To filter by Status, select the desired status from the available options. The Status options include: - Pending Referral - Pending Confirmation - Confirmed - Coin Credit - Expired - Failed Transaction 3. **Mode**: You can filter by Mode by selecting the specific mode of transaction from the available options. The Modes include: - WERT - Link - Coinbase - AOG - Transfi - Wallet - Stripe By using these filter options, you can precisely narrow down the Recharge Records based on the Account, Status, or Mode you are interested in.`,
  "What statuses and modes are available for filtering Recharge Records?": `When filtering Recharge Records, you can use the following options: Statuses: - Pending Referral - Pending Confirmation - Confirmed - Coin Credit - Expired - Failed Transaction Modes: - WERT - Link - Coinbase - AOG - Transfi - Wallet - Stripe These statuses and modes help you refine your search for Recharge Records based on specific criteria. If you have any more questions or need further assistance, feel free to ask!`,

  // export-recharges
  "How can I export Recharge Records in PDF or Excel format?": `To export Recharge Records in PDF or Excel format, follow these steps: 1. Go to the Recharge Records section in the Super-User dashboard. 2. Select the filters you want to apply (Search By, Status, Mode) to refine the data you want to export. 3. Look for the Export button at the top right of the page. 4. Click on the Export button and choose the format you prefer: PDF or Excel. 5. Once you select the format, the system will generate the report based on your filters, and you can download the exported file accordingly. If you encounter any issues or need further assistance, feel free to ask!`,
  "What data is included in the exported Recharge Records?": `When you export Recharge Records, the following data will be included in the exported file: - **Action** - **Accounts** - **Recharged** - **Remark** - **Status** - **Failed Reason** - **Transaction Confirmation Link** - **Parent** - **Mode** - **Recharge Date** This information provides details about each recharge transaction for Agents and Players within the system.`,

  // recharge-actions
  "How do I copy the recharge confirmation URL for a Pending Confirmation status?": `To copy the recharge confirmation URL for a transaction with a Pending Confirmation status, you need to follow these steps: 1. Locate the transaction with the Pending Confirmation status in the Recharge Records. 2. Look for the **Action** button associated with that transaction. 3. Click on the **Copy** button within the **Action** section of the transaction details. 4. This action will copy the recharge confirmation URL to your clipboard. 5. You can then manually confirm the recharge for the Player using the copied URL. If you need further assistance or have any other questions, feel free to ask!`,
  "How can I credit coins to a Player for a Confirmed recharge?": `To credit coins to a Player for a Confirmed recharge, follow these steps: 1. In the Recharge Records section, locate the specific recharge transaction with a status of **Confirmed** or **Confirmed Coin Credit.** 2. Click on the **Action** button associated with that recharge transaction. 3. Look for the **Coin Credit** button within the action options. 4. Click on the **Coin Credit** button. 5. A confirmation dialog will appear with a message asking, **Are you sure you have transferred the points/coins to this user? This action is not reversible.** 6. Click **Confirm** to credit the coins to the Player. The action will be completed, and the coins will be successfully credited to the Player. By following these steps, you can easily credit coins to a Player for a Confirmed recharge transaction. If you have any more questions or need further assistance, feel free to ask!`,

  // view-redeems
  "How can I view all Redeem Records for Players?": `To view all Redeem Records for Players, you can access the Redeem Records section in the Super-User dashboard. Here are the steps to view Redeem Records for Players: 1. Log in to your Super-User account. 2. Navigate to the Redeem Records section. 3. Look for the list of Redeem Records that includes columns such as Accounts, Redeemed, Remark, Status, Service Fee, Parent, Redeem Date, Payment Method, and Payment Id. 4. You can filter the records by using the Search By and Status options. - Search By options include Account, Recharge, Remark, and Parent Name. - Statuses include Failed, Pending Approval, Rejected, Redeem Successfully, Expired, Failed Transaction, Cashout, Cashout Successfully, and Cashout Reject. 5. You can export the data in PDF and Excel formats for further analysis.`,
  "What details are shown in the Redeem Records table?": `In the Redeem Records table, you will find the following columns displayed: - **Action** - **Accounts** - **Redeemed** - **Remark** - **Status** - **Service Fee** - **Parent** - **Redeem Date** - **Payment Method** - **Payment Id** These columns provide information about the redeemed transactions for Players under your management.`,

  // filter-redeems
  "How do I filter Redeem Records by Account or Status?": `To filter Redeem Records by Account or Status, you can follow these steps: 1. Go to the Redeem Records section in the Super-User interface. 2. Look for the filter options provided on the page. 3. You can filter Redeem Records by Account, Recharge, Remark, Parent Name, and Status. 4. Select the desired filter option (Account or Status). 5. For Account: - Enter the Account number you want to filter by. 6. For Status: - Choose from the following status options: Failed, Pending Approval, Rejected, Redeem Successfully, Expired, Failed Transaction, Cashout, Cashout Successfully, or Cashout Reject. 7. Click on the **Apply Filter** button to view the filtered Redeem Records based on your selection. If you need further assistance or more details on filtering Redeem Records, feel free to ask!`,
  "What statuses are available for filtering Redeem Records?": `You can filter Redeem Records by the following statuses: - Failed - Pending Approval - Rejected - Redeem Successfully - Expired - Failed Transaction - Cashout - Cashout Successfully - Cashout Reject Is there anything else you would like to know about Redeem Records or any other feature on the website?`,

  // export-redeems
  "How can I export Redeem Records in PDF or Excel format?": `To export Redeem Records in PDF or Excel format, follow these steps: 1. Go to the **Redeem Records** section in the Super-User dashboard. 2. Filter and view the Redeem Records based on your criteria. 3. Look for the option to export the data, usually located at the top right of the page. 4. Click on the **Export** button. 5. A prompt will appear asking you to select the format (PDF or Excel) for the export. 6. Choose the desired format (PDF or Excel) for the Redeem Records export. 7. The system will generate the PDF or Excel report based on your selection for you to download and save. If you need further assistance, feel free to ask!`,
  "What data is included in the exported Redeem Records?": `When you export Redeem Records, the following data is typically included in the exported file: - Accounts - Redeemed Amount - Remark - Status - Service Fee - Parent - Redeem Date - Payment Method - Payment ID This information gives a detailed overview of the redemption activities for Players under your management.`,

  // redeem-actions
  "How do I approve or reject a Pending Approval redeem request?": `To approve or reject a Pending Approval redeem request, follow these steps: 1. Log in to the Super-User section of the GETWAYS platform. 2. Navigate to the Redeem Records section. 3. Locate the Pending Approval redeem request for the specific Player. 4. Click on the **Action** button associated with the redeem request. 5. You will see two buttons: ✅ (tick) and ❌ (cross). 6. Click on the ✅ (tick) button to approve the redeem request. This action will complete the redeem process for the Player. 7. If you need to reject the redeem request, click on the ❌ (cross) button. 8. By clicking ❌ (cross), you can reject the redeem request and update the status accordingly. Following these steps will allow you to approve or reject Pending Approval redeem requests for Players under your supervision.`,
  "How can I confirm or reject a Cashout request for a Player?": `To confirm or reject a Cashout request for a Player, follow these steps: 1. Access the Redeem Records section in the Super-User dashboard. 2. Locate the specific Cashout request for the Player you want to take action on. 3. If the status of the Cashout request is **Cashout** or **Confirmed,** you will see the option to take action. 4. Click on the **Action** button for that Cashout request. 5. You will see two buttons: a green tick symbol (✅) and a red cross symbol (❌). 6. Click on the green tick symbol (✅) to confirm the Cashout for the Player. 7. Alternatively, click on the red cross symbol (❌) to reject the Cashout request. 8. Once you confirm or reject the Cashout request, the status will be updated accordingly in the system. If you have any more questions or need further assistance, feel free to ask!`,
  "How do I reject a Cashout Successfully or Undone Cashout with a remark?": `To reject a Cashout Successfully or Undone Cashout for a player with a remark, you can follow these steps: 1. Access the Redeem Records section in the Super-User dashboard. 2. Locate the specific Cashout Successfully or Undone Cashout transaction you want to reject. 3. Click on the **Actions** button for that transaction. 4. Look for the ❌ (cross) button, which is used for rejecting the transaction. 5. Click on the ❌ (cross) button to initiate the rejection process. 6. A dialog box will appear asking you to enter a remark for the rejection. 7. Enter the reason or remark for rejecting the Cashout request. 8. Confirm the rejection by clicking on the **Confirm** button. 9. The system will update the status of the transaction accordingly and include the remark you provided. By following these steps, you can reject a Cashout Successfully or Undone Cashout transaction for a player with a specific remark.`,

  // view-summary
  "What metrics are included in the Summary page?": `The Summary page includes the following metrics: - Total number of users - Total Agents - Total Recharges - Total Redeems - Pending Recharges - Failed Redeems - Total Cashout Redeems Successful - Total Cashout Redeems Pending - Total Fees Charged - Total Wallet Balance If you need more details or have any specific questions about these metrics, feel free to ask!`,
  "How can I view the total number of users, recharges, or redeems?": `To view the total number of users, recharges, or redeems, you need to access the Summary page on the GETWAYS Super-User platform. Once on the Summary page, you can provide the Start Date and End Date to filter the data and then click the Apply Filter button. This will display a detailed overview that includes metrics such as the total number of users, total recharges, total redeems, pending recharges, failed redeems, total cashout redeems successful, total cashout redeems pending, total fees charged, and total wallet balance. You can generate month-wise PDF and Excel reports for recharges and redeems by clicking the Export button at the top right of the page. You can select the desired month to export the report in PDF or Excel format without entering the Start Date and End Date again. Is there anything else you would like to know about viewing the summary data?`,
  "What does the Total Wallet Balance represent?": `The Total Wallet Balance represents the total balance of all Players under a Super-User. It provides an overview of the combined balance of all Players managed by the Super-User.`,

  // filter-summary
  "How do I filter the Summary by Start Date and End Date?": `To filter the Summary by Start Date and End Date, you need to provide the specific dates you want to analyze and then click the **Apply Filter** button. This will display the summarized data within the specified date range. Is there anything else you would like to know about the Summary section or filtering options?`,
  "How can I filter Total Recharge by Wallet, Others, or All?": `To filter Total Recharge by Wallet, Others, or All in the Summary section, you need to follow these steps: 1. Go to the Summary page. 2. Look for the Total Recharge section. 3. Within the Total Recharge section, you will find a dropdown menu that allows you to select the filter options: Wallet, Others, or All. 4. By default, the filter is set to All. You can choose to filter the Total Recharge based on Wallet transactions, Others transactions, or view All transactions. 5. Select your desired filter option from the dropdown menu to view the Total Recharge data based on your selection. If you have any more questions or need further assistance, feel free to ask!`,

  // search-users
  "How do I search for a specific Master Agent, Agent, or Player in the Summary?": `In the Summary section, you can search for a specific Master Agent, Agent, or Player by providing their name in the search bar. After entering the name, click on the **Apply Filter** button to view the data related to that specific user. This search functionality allows you to focus on the specific user's metrics and data within the Summary report.`,
  "What details are shown for searched users in the Summary?": `In the Summary section, when searching for users, you can view various details such as: - Total number of users - Total Agents - Total Recharges - Total Redeems - Pending Recharges - Failed Redeems - Total Cashout Redeems Successful - Total Cashout Redeems Pending - Total Fees Charged - Total Wallet Balance - Total Recharge (Filtered) Additionally, you can generate month-wise PDF and Excel reports for Recharge and Redeem by clicking the Export button at the top right of the page. If you need more specific information or details, feel free to ask!`,

  // export-reports
  "How do I generate month-wise PDF or Excel reports for Recharge and Redeem?": `To generate month-wise PDF or Excel reports for Recharge and Redeem, follow these steps: 1. Go to the Summary section of the Super-User platform. 2. To generate the reports, click on the **Export** button at the top right of the page. 3. When prompted, select the desired month for which you want to export the report. 4. Choose the type of report you want to generate: - PDF for Recharge - Excel for Recharge - PDF for Redeem - Excel for Redeem By following these steps, you can easily generate month-wise PDF or Excel reports for Recharge and Redeem transactions on the platform. Let me know if you need further assistance!`,
  "What data is included in the exported reports?": `The exported reports include detailed data related to Recharge and Redeem transactions. Here is the breakdown of the data included in the exported reports:\n\nFor Recharge Reports:\n- Recharge ID\n- Amount\n- Status\n- Stripe ID\n- Payment Type\n- Agent Name\n- User Name\n\nFor Redeem Reports:\n- Amount\n- Transaction Date\n- Status\n- Redeem Service Fee\n- Agent Name\n- User Name\n\nYou can generate month-wise PDF and Excel reports for Recharge and Redeem transactions by clicking the Export button at the top right of the page. Let me know if you need more information or assistance!`,

  // overview-report
  "What data is shown in the Overview Report?": `In the Overview Report, you can view the following data: 1. **Conversion Rate**: Indicates the rate of conversion. 2. **Ticket Amount**: Displays the total ticket amount. 3. **Transaction Overview - Pie Chart**: Illustrates the distribution of various transaction types within the system. 4. **Agent Overview - Bar Chart**: Demonstrates the distribution of different transaction types in the system. 5. **Agent Overall Report Table**: Includes columns like Agent Name, Total Recharge, Total Redeem, and Total Cashout. You can sort the table by clicking on the column headers, search for a specific agent, and download the report in PDF format by clicking on the Export button.`,
  "How do I generate the Agent Overall Report in PDF format?": `To generate the Agent Overall Report in PDF format, follow these steps: 1. Go to the Reports section in the Super-User dashboard. 2. Select the **Overview Report** tab. 3. Provide the start date and end date to filter the data. 4. Look for the **Agent Overall Report Table** which consists of columns like Agent Name, Total Recharge, Total Redeem, and Total Cashout. 5. You can sort the table by clicking on the column headers or search for a specific agent by typing in the search box. 6. Click on the **Export** button located at the top right of the page. 7. Choose the PDF format for the report you want to generate. 8. The system will generate the PDF file named **Agent Overall Report** for you to download and review. If you have any more questions or need further assistance, feel free to ask!`,
  "What does the Transaction Overview Pie Chart represent?": `The Transaction Overview Pie Chart in the Overview Report represents the distribution of various transaction types within the system. It visually illustrates how transactions are divided among different categories within the platform.`,

  // comparison-report
  "How do I compare data between two dates, months, or years?": `To compare data between two dates, months, or years in the Comparison Report section, follow these steps: 1. Provide two dates, months, or years that you want to compare. 2. Click on the **Apply Filter** button. 3. The system will compare the data for the specified periods and display the comparison in bar charts. 4. You will see three types of bar charts: - Data Comparison for Recharge - Data Comparison for Redeem - Data Comparison for Cashout This allows you to analyze and compare transaction data over different time periods to gain insights into trends and performance.`,
  "What do the Data Comparison Bar Charts for Recharge, Redeem, and Cashout show?": `The Data Comparison Bar Charts for Recharge, Redeem, and Cashout in the Comparison Report allow users to analyze and compare transaction data between two dates, months, or years. These bar charts visually represent the comparison of transaction activities for Recharge, Redeem, and Cashout over the selected time period. By providing two specific dates, months, or years and applying the filter, users can view and compare the transaction volumes for different activities within the system.`,

  // agent-overview
  "How do I analyze an Agent’s transactions in the Agent Overview?": `To analyze an Agent’s transactions in the Agent Overview section, you need to follow these steps: 1. Provide the Agent Name, Start Date, and End Date to filter the data. 2. Click on the **Apply Filter** button to view the data. 3. You will see the following data: - Total Transaction Summary: This is represented in a Pie Chart, illustrating the transaction breakdown for the Agent's Recharge, Redeem, and Cashout. - Daily Transactions: Displayed in a Line Chart, showing the day-wise transactions of the Agent's Recharge, Redeem, and Cashout from the given start date to the end date. By following these steps, you can effectively analyze an Agent's transactions in the Agent Overview section. If you need further clarification or assistance, feel free to ask!`,
  "What does the Total Transaction Summary Pie Chart show for an Agent?": `The Total Transaction Summary Pie Chart for an Agent shows the breakdown of transactions into different categories such as Recharge, Redeem, and Cashout. It provides a visual representation of how the total transactions are distributed among these categories for a particular agent.`,
  "How is the Daily Transactions Line Chart generated?": `The Daily Transactions Line Chart in the Agent Overview page is generated based on the day-wise transactions of a particular agent, including Recharge, Redeem, and Cashout, within the specified start date and end date. It provides a visual representation of the transaction activity over time for that specific agent.`,

  // player-overview
  "How do I view transactional analysis for all Players?": `To view transactional analysis for all Players in the Player Overview section, you need to provide the Start date and End date for the analysis. After entering the dates, click on the **Apply Filter** button to see the data. This will allow you to view all the transactional data related to Players within the specified date range.`,
  "How can I filter Player data by Agent name?": `To filter Player data by Agent name in the Player Overview section, you need to provide the Agent's name along with the Start date and End date. After entering this information, click on the **Apply Filter** button to view the data specifically related to that Agent's players.`,
  "What does the Players Transaction Overview Bar Chart represent?": `The Players Transaction Overview Bar Chart in the Player Overview section illustrates the distribution of different transaction types within the system related to Recharge, Redeem, and Cashout for players. It provides a visual representation of how transactions are distributed among players in terms of Recharge, Redeem, and Cashout activities.`,

  // player-comparison
  "How do I compare Player transaction data between two dates or months?": `To compare Player transaction data between two dates or months, follow these steps: 1. Go to the Reports section on the GETWAYS platform. 2. Select the **Player Comparison** tab. 3. Provide the two specific dates or months you want to compare. 4. Click on the **Apply Filter** button to see the data. 5. The system will then display the comparison data in bar charts, showing the transaction details for the selected players within the specified time frame. 6. You can analyze the data based on Recharge, Redeem, and Cashout transactions for the selected players. If you need further assistance or detailed guidance on this process, feel free to ask!`,
  "How can I filter Player Comparison data to show top 5, 10, or 20 Players?": `To filter Player Comparison data to show the top 5, 10, or 20 Players, you can use the dropdown filter located in the top right of the Player Comparison section. This filter allows you to select the number of players you want to display in the comparison. By default, the view is set to the top 30 players. Simply adjust the filter to see the desired number of players in the comparison. Let me know if you need more details!`,
  "What does the Data Comparison for Recharge show for a specific Player?": `The Data Comparison for Recharge for a specific Player allows you to analyze and compare the recharge transactions of that player with others. You can filter the data to see the top 5 players, top 10 players, top 20 players, or view all players. The default view will show the top 30 players based on recharge transactions.`,

  // particular-player
  "How do I analyze transactions for a specific Player?": `To analyze transactions for a specific player in the Particular Player Report section, follow these steps: 1. Provide the Player Name: Enter the name of the player you want to analyze. 2. Select the Start Date and End Date: Specify the date range for the transactions you want to review. 3. Click on the **Apply Filter** button. After applying the filter, you will see the following data for the specific player: - Total Transaction Summary: A pie chart illustrating the distribution of Recharge, Redeem, and Cashout transactions for the player. - Daily Player Transactions: A line chart displaying day-wise transactions of the selected player, including Recharge, Redeem, and Cashout, within the specified date range.`,
  "What does the Total Transaction Summary Pie Chart show for a Player?": `The Total Transaction Summary Pie Chart for a Player displays the distribution of different transaction types - Recharge, Redeem, and Cashout - for that specific player. It provides a visual breakdown of how the player's transactions are allocated among these categories.`,
  "How is the Daily Player Transactions Line Chart generated?": `The Daily Player Transactions Line Chart in the Particular Player Report is generated based on the transactions of a specific player over a given time period. It displays the day-wise breakdown of the player's Recharge, Redeem, and Cashout activities. The chart helps visualize the player's transaction patterns and activity levels on a daily basis.`,

  // kyc-report
  "How do I view the KYC Status Overview Pie Chart?": `To view the KYC Status Overview Pie Chart, you can access it in the KYC section of the Reports. Once you navigate to the KYC section, you will see the pie chart representing the overview of KYC statuses. The different colors in the pie chart represent various KYC statuses such as Expired, Failed, Initiated, Pending, Success, and Manual Review. Simply look for the chart in the KYC section to get an overall view of the KYC statuses.`,
  "What do the colors in the KYC Status Pie Chart represent?": `In the KYC Status Pie Chart: - Orange Color represents KYC Expired - Red Color represents KYC Failed - Yellow Color represents KYC Initiated - Blue Color represents KYC Pending - Green Color represents KYC Success - Light Green represents KYC Manual Review These colors help differentiate and visually represent the different KYC statuses in the system.`,
  "How can I generate a PDF report for KYC records?": `To generate a PDF report for KYC records, you can follow these steps: 1. Go to the KYC section in the Super-User area. 2. Navigate to the KYC Records table. 3. Click on the **Export** button located at the top right of the table. 4. The system will generate the PDF report for the KYC records accordingly. Feel free to let me know if you need more detailed instructions or assistance with anything else!`,

  // transaction-export
  "How do I generate an Excel report for transaction data?": `To generate an Excel report for transaction data, follow these steps: 1. Provide the Start Date and End Date for the data you want to export. 2. Click on the **Export All** button. 3. Select the Excel option from the export menu. 4. The system will generate the Excel report containing transaction details based on the specified date range. If you need any more assistance or have further questions, feel free to ask!`,
  "What columns are included in the Transaction Export Excel report?": `The Transaction Export Excel report includes the following columns: - Transaction ID - Type - Amount - Transaction Date - Status - Stripe Transaction ID - Redeem Service Fee - Agent Name - Username - Agent Parent Name - isCashout - Payment Mode - Payment Method Type - Remark - Redeem Remark If you need more details or assistance with anything else, feel free to ask!`,
  "Can I specify a time period for the Transaction Export?": `Yes, you can specify a time period for the Transaction Export. When generating an Excel report, you can provide the Start Date and End Date to export data for a particular time period. Additionally, you can also specify the Start Time and End Time along with the Start Date and End Date for more specific time-based data export.`,

  // view-kyc
  "How do I view all KYC Records in the KYC Records Page?": `To view all KYC Records on the KYC Records Page, you can follow these steps: 1. Go to the KYC section of the Super-User interface. 2. Look for the table displaying KYC Records. 3. The table will contain columns like Account, Email, Parent, KYC Status, verified, Failed Reason, and Created At. 4. You can sort the table by clicking on the column headers. 5. Use the search boxes at the upper left corner to search via Email or Parent name. 6. Filter records by Status by clicking on **Status** and selecting the desired filter option (All, KYC Success, KYC Pending, KYC Failed, KYC Expired). 7. By default, the filter is set to All, showing all records. 8. To generate a PDF report of the KYC Records, click on the Export button at the top right of the table. 9. The system will generate the PDF report containing all KYC Records accordingly. Following these steps will allow you to easily view all KYC Records on the KYC Records Page.`,
  "What details are shown in the KYC Records table?": `In the KYC Records table, the following details are shown for each record: - Account - Email - Parent - KYC Status - Verified - Failed Reason - Created At You can sort the table by clicking on the column headers, search by email or parent name, filter records by status, and generate a PDF report of the KYC Records. If you need more specific information or assistance with KYC Records, feel free to ask!`,

  // filter-kyc
  "How do I filter KYC Records by Email or Parent Name?": `To filter KYC Records by Email or Parent Name, you can follow these steps: 1. Look for the search boxes located at the upper left corner of the KYC Records table. 2. Enter the email address in the first search box to filter records by Email. 3. Enter the parent name in the second search box to filter records by Parent Name. 4. The system will automatically filter the KYC Records based on the information you entered in the search boxes. Feel free to ask if you need more information or assistance on this topic!`,
  "How can I filter KYC Records by Status (Success, Pending, Failed, Expired)?": `To filter KYC Records by Status (Success, Pending, Failed, Expired), you can follow these steps: 1. Go to the KYC section of the Super-User platform. 2. Look for the option to filter records by status. It is usually located at the top right corner of the table. 3. Click on **Status** to access the filter options. 4. Select the desired status filter from the available options: All, KYC Success, KYC Pending, KYC Failed, KYC Expired. 5. Once you select a specific status filter, the table will update to display only the KYC records that match the selected status. By following these steps, you can easily filter KYC Records by Status to view the specific information you need. Let me know if you need further assistance!`,

  // export-kyc
  "How do I generate a PDF report for KYC Records?": `To generate a PDF report for KYC Records, you can follow these steps: 1. Go to the KYC section in the Super-User interface. 2. Look for the option to export the KYC records. It is usually located at the top right of the table. 3. Click on the **Export** button. 4. A dialog box will appear, allowing you to select the format for the export. Choose the PDF option. 5. The system will generate the PDF report based on the KYC records available in the table. If you encounter any issues or need further assistance, feel free to ask!`,
  "What data is included in the exported KYC Records report?": `The exported KYC Records report includes the following data columns: - Account - Email - Parent - KYC Status - Verified - Failed Reason - Created At You can sort the table by clicking on the column headers, search via Email or Parent, filter records by Status, and generate a PDF of the KYC Records report by clicking the Export button.`,

  // view-gift-cards
  "How can I view all Gift Card Transactions?": `To view all Gift Card Transactions on the Gift Card Page, follow these steps: 1. Navigate to the Gift Card section in the Super-User interface. 2. Locate the table displaying Gift Card Transactions. 3. The table will include columns such as Username, Order ID, Price, Product ID, Product Name, Status, Product Image, and Created At. 4. You can sort the table by clicking on any column header to organize the data as needed. 5. Use the search box at the top left of the table to search for transactions by Username. 6. Filter transactions by Status using the Status Filter option next to the search box. By default, the Status Filter is set to All, displaying all transactions. Following these steps allows you to easily view and manage all Gift Card Transactions on the Gift Card Page. If you need further assistance with managing Gift Card Transactions, feel free to ask!`,
  "What details are shown in the Gift Card Transactions table?": `The Gift Card Transactions table displays the following details for each transaction: - Username - Order ID - Price - Product ID - Product Name - Status - Product Image - Created At. You can sort the table by clicking on the column headers, search for transactions by Username using the search box, and filter transactions by Status using the Status Filter option. If you need further assistance with managing Gift Card Transactions, feel free to ask!`,

  // search-username
  "How do I search for Gift Card Transactions?": `You can search for gift card transactions by Username, follow these steps: 1. Go to the Gift Card section in the Super-User interface. 2. Locate the search box at the top left corner of the Gift Card Transactions table. 3. Enter the Username you want to search for in the search box. 4. The system will automatically filter the table to display only the Gift Card Transactions associated with the entered Username. If no transactions are found for the specified Username, the table will show no results. Ensure the Username is entered correctly, and try again if needed. If you need further assistance with managing Gift Card Transactions, feel free to ask!`,

  // filter-status
  "How can I filter Gift Card Transactions by Status?": `To filter Gift Card Transactions by Status, follow these steps: 1. Navigate to the Gift Card section in the Super-User platform. 2. Find the Status Filter option, typically located next to the search box at the top-left of the Gift Card Transactions table. 3. Click on the **Status** filter to view the available options: All, Processed, Failed, Pending. 4. Select the desired status from the dropdown menu. 5. The table will update to show only the transactions matching the selected status. By default, the filter is set to All, displaying all transactions. This allows you to focus on specific transaction statuses as needed. Let me know if you need further help!`,
  "What does each status represent in the Gift Card Transactions table?": `In the Gift Card Transactions table, the statuses represent the following: - **All**: Displays all transactions regardless of their status. - **Processed**: Indicates transactions that have been successfully completed. - **Failed**: Shows transactions that did not complete successfully, possibly due to payment issues or other errors. - **Pending**: Represents transactions that are still in progress and awaiting completion or confirmation. You can filter transactions by these statuses using the Status Filter option, sort the table by clicking column headers, or search by Username to narrow down results. If you need more details, feel free to ask!`,

  // view-wallet-audit
  "How can I view the Wallet Audit Report?": `To view the Wallet Audit Report, follow these steps: 1. Navigate to the Wallet Audit section in the Super-User interface. 2. Locate the table displaying deatils of that. 3. The table includes columns: Username, Wallet, WERT Total, Coinbase Total, Link Total, USDC Balance, Difference, and Actions. 4. Sort the table by clicking on any column header to organize the data. If you need further assistance, feel free to ask!,
  "What details are shown in the Wallet Audit Report table?": The Wallet Audit Report table displays the following details: - Username, Wallet, WERT Total, Coinbase Total, Link Total, USDC Balance, Difference, Actions. You can sort the table by column headerr. If you need further assistance with Wallet Audit Report, feel free to ask!`,

  // search-username
  "How do I search for Wallet Audit transactions?": `You search for Wallet Audit transactions by Username, follow these steps: 1. Go to the Wallet Audit section in the Super-User interface. 2. Locate the search box at the top left corner of the Wallet Audit Report table. 3. Enter the Username you want to search for. 4. The table will automatically filter to show only transactions associated with the entered Username. If no transactions are found, the table will display no results. Ensure the Username is entered correctly. If you need further assistance with Wallet Audit Report, feel free to ask!`,

  // export-data
  "How can I export the Wallet Audit Report data?": `To export the Wallet Audit Report data, follow these steps: 1. Navigate to the Wallet Audit section in the Super-User interface. 2. Locate the Export button at the top right of the Wallet Audit Report table. 3. Click the Export button to generate an Excel report containing the table data, including Username, Wallet, WERT Total, Coinbase Total, Link Total, USDC Balance, and Difference. 4. The system will download the report to your device. If you need further assistance with Wallet Audit Report, feel free to ask!`,

  // filter-mode
  "How can I filter Wallet Audit transactions by Mode?": `To filter Wallet Audit transactions by Mode, follow these steps: 1. Navigate to the Wallet Audit section in the Super-User interface. 2. Click the Actions menu for a specific user in the Wallet Audit Report table. 3. In the modal, locate the Mode Filter option at the top. 4. Select from the available options: All Modes, WERT, Coinbase, Link, or Other. 5. The modal's table will update to show only transactions matching the selected mode. By default, the filter is set to All Modes. Use the Close button at the bottom of the modal to exit. If you need further assistance, feel free to ask!`,
  "What does each mode represent in the Wallet Audit transactions modal?": `In the Wallet Audit transactions modal, the modes represent the following: - **All Modes**: Displays all transactions regardless of mode. - **WERT**: Shows transactions processed through WERT. - **Coinbase**: Shows transactions processed through Coinbase. - **Link**: Shows transactions processed through Link. - **Other**: Shows transactions not categorized under WERT, Coinbase, or Link. You can filter by these modes using the Mode Filter in the modal, or close the modal using the Close button. If you need more details, feel free to ask!`,
  // global-settings
  "How do I enable or disable Recharge globally for all users?": `To enable or disable Recharge globally for all users, follow these steps: 1. Access the Profile Options by clicking on the profile icon in the top-right corner. 2. Look for the **Global Recharge & Cashout Settings** section. 3. Toggle the switch next to **Enable Recharge (Global)** to turn Recharge functionality on or off for all Agents and Players globally. 4. Your changes will be applied immediately across the platform. If you have any more questions or need further assistance, feel free to ask!`,
  "How can I enable or disable Cashout globally for all users?": `To enable or disable Cashout globally for all users as a Super User, you can follow these steps: 1. Access the Profile Options by clicking on the profile icon in the top-right corner of the Super-User section. 2. Look for the **Global Recharge & Cashout Settings** option. 3. Within this section, you will find a toggle switch labeled **Enable Cashout (Global).** 4. Toggle the switch to enable or disable Cashout functionality for all Agents and Players globally. 5. Note: Disabling Cashout globally will restrict all users from initiating cashout transactions until the feature is enabled again. If you have any more questions or need further assistance, feel free to ask!`,
  "What happens if I disable Recharge for a specific Agent?": `If a Super User disables Recharge for a specific Agent, the Recharge functionality is also disabled for all Players under that Agent. This means that neither the Agent nor the Players under them will be able to perform recharges until the Super User re-enables the Recharge option for that Agent.`,

  // payment-methods
  "How do I enable or disable a payment method like CashApp or PayPal?": `To enable or disable a payment method like CashApp or PayPal, you can follow these steps in the Manage Payment Methods section: 1. Access the Manage Payment Methods option in the Profile Options. 2. Look for the list of payment methods displayed, which may include CashApp, PayPal, Venmo, Zelle, and others. 3. Each payment method will have a toggle switch next to it. 4. To enable a payment method, simply toggle the switch to the **ON** position. 5. To disable a payment method, toggle the switch to the **OFF** position. By following these steps, you can easily enable or disable payment methods such as CashApp or PayPal based on your preferences and requirements. If you need further assistance, feel free to ask!`,
  "What payment methods are available to manage?": `The Manage Payment Methods section allows you to view and control various payment methods such as CashApp, PayPal, Venmo, and Zelle. Each method has a toggle switch that enables you to easily enable or disable them based on your preferences.`,

  // emergency-messages
  "How do I compose and send emergency messages to Agents and Master Agents?": `To compose and send emergency messages to Agents and Master Agents as a Super User, follow these steps: 1. Go to the Profile Options section. 2. Select **Manage Emergency Messages.** 3. In the text area provided, compose your emergency message. 4. Once you have crafted your message, you can send it out to all Agents and Master Agents under your supervision. By sending out emergency messages, you can efficiently communicate important information to your team in a timely manner. If you have any more questions or need further assistance, feel free to let me know!`,
  "Can I send multiple emergency messages at once?": `Yes, in the Profile Options section, you can compose multiple emergency messages in a text area. These messages can be sent to all Agents and Master Agents under the Super User simultaneously. So, you can send multiple emergency messages at once to ensure timely communication.`,

  // help-videos
  "How can I access Help Videos for Login and Sign-Up processes?": `To access the Help Videos for Login and Sign-Up processes, follow these steps: 1. Click on the profile icon located in the top-right corner of the page. 2. Select the **Help Videos** option. 3. From there, you can watch videos that provide guidance on the Login and Sign-Up processes. If you have any more questions or need further assistance, feel free to ask!`,
  "What topics are covered in the Help Videos?": `The Help Videos cover various topics related to the platform, such as the Login and Sign-Up processes. These videos provide guidance and assistance on how to navigate and use the platform effectively. If you need more detailed information or assistance with any specific topic covered in the videos, feel free to ask!`,

  // logout
  "How do I log out of my Super-User account?": `To log out of your Super-User account, you can typically follow these steps: 1. Look for the profile icon in the top-right corner of the page. 2. Click on the profile icon to access the profile options. 3. In the profile options menu, you should see the **Logout** option. 4. Click on **Logout** to log out of your Super-User account. If there are specific steps or options related to logging out in your account interface that differ from these general steps, please let me know for more detailed guidance.`,
  "What happens to my session after logging out?": `When you log out of your Master Agent account, your session will be terminated, which means you will be signed out of the system. This action ensures the security of your account by ending your current session and requiring you to log in again to access the Super-User platform. If you have any more questions or need further assistance, feel free to ask!`,
};
