echo starting user-service
cd user-service
start cmd.exe /k "npm run dev"

cd ..
cd question-service
echo starting question-service
start cmd.exe /k "npm run dev"

cd ..
cd collab-service
echo starting collab-service
start cmd.exe /k "npm run dev"

cd ..
cd matching-service
echo starting matching-service
start cmd.exe /k "npm run dev"

cd ..
cd communication-service
echo starting communication-service
start cmd.exe /k "npm run dev"

cd ..
cd frontend
echo starting frontend
start cmd.exe /k "npm start"
