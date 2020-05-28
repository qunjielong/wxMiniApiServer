deploy:
	env GOOS=linux GOARCH=amd64 go build -o build/wx-remote-api/wx-remote-api main.go
	cd build/wx-remote-api
	git add -A
	git commit -am "OJBK"
	git push origin master #ssh://qjl@101.132.168.128:/home/qjl/git/wx-remote-api 
