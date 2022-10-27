echo starting user-service
cd user-service
call npm i
start cmd.exe /k "npm run dev"

cd ..
cd question-service
echo starting question-service
call npm i
start cmd.exe /k "npm run dev"

cd ..
cd collab-service
echo starting collab-service
call npm i
start cmd.exe /k "npm run dev"

cd ..
cd matching-service
echo starting matching-service
start cmd.exe /k "npm run dev"

cd ..
cd communication-service
echo starting communication-service
call npm i
start cmd.exe /k "npm run dev"

cd ..
cd frontend
echo starting frontend
call npm i
start cmd.exe /k "npm start"
