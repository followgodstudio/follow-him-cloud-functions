# follow him firebase cloud functions

# Use emulator to test

firebase emulators:start

# Deploy one function

firebase deploy --only functions:user_notifications-pushMessage

# Switch between projects

firebase use walkwithgod-dev
firebase use walkwithgod-73ee8
