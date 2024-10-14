import * as THREE from '../build/three.module.js';
import * as CANNON from "https://cdn.skypack.dev/cannon-es";

class App {
    constructor() {
        const divContainer = document.querySelector("#webgl-container");
        this._divContainer = divContainer;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        divContainer.appendChild(renderer.domElement);
        this._renderer = renderer;

        this._scene = new THREE.Scene();

        this.physicsWorld = this.initPhysics(); // 물리 세계 초기화

        this._setupCamera();
        this._setupLight();
        this._setupModel(); // 모델 설정

        window.onresize = this.resize.bind(this);
        this.resize();

        this.questions = this._initializeQuestions();
        this.currentQuestionIndex = 0;
        this.showQuestion();

        requestAnimationFrame(this.render.bind(this));
    }

    initPhysics() {
        const physicsWorld = new CANNON.World({
            gravity: new CANNON.Vec3(0, -1.1, 0), // 지구 중력
        });
        return physicsWorld;
    }

    _initializeQuestions() {
        return [
            {
                question: "1. 평소 가장 자주 이용하는 SNS 플랫폼은 무엇인가요?",
                options: ["인스타그램", "유튜브", "트위터", "페이스북", "틱톡"]
            },
            {
                question: "2. 선택하신 플랫폼에서 제공하는 '저장'기능을 자주 이용하십니까?",
                options: ["전혀 그렇지 않다", "대체로 그렇지 않다", "보통이다", "대체로 그렇다", "매우 그렇다"]
            },
            {
                question: "3. 본인의 휴대폰에 저장된 정보의 갯수 중 가장 많다고 생각이 든 것의 갯수는 몇 개인가요?",
                isOpenEnded: true // 주관식 질문
            },
            {
                question: "4. SNS를 이용하고 웹 서핑을 하면서 자의로 정보를 접하고 수집한다고 느끼는 비율은 어느 정도인가요?",
                options: ["전혀 그렇지 않다", "대체로 그렇지 않다", "보통이다", "대체로 그렇다", "매우 그렇다"]
            },
            {
                question: "언젠간 필요하지 않을까? 라며 정보를 쌓아두고 다시 찾지 못하거나, 그대로 잊은 경험이 있나요?",
                options: ["네", "아니오"]
            },
            {
                question: "6. 습관적으로 새로운 정보를 얻기 위해 무의식적인 새로고침을 여러 번 시도한 적이 있나요?",
                options: ["네", "아니오"]
            },
            {
                question: "6. 알고리즘에 대한 거부감을 느끼시나요? ",
                options: ["네", "아니오"]
            },
            {
                question: "7. 디지털 공간에서 '알고리즘'에 의한 무력감, 공포감 등을 느낀 경험이 있다면 자세히 서술해 주세요.",
                isOpenEnded: true // 주관식 질문
            },
            {
                question: "8. 당신이 겪은 '디지털 공간에서의 상실'은 어떤 것이었나요?",
                isOpenEnded: true // 주관식 질문
            },
        ];
    }
    
    showQuestion() {
        const questionContainer = document.getElementById('questionContainer');
        const currentQuestion = this.questions[this.currentQuestionIndex];
        questionContainer.innerHTML = `<h3>${currentQuestion.question}</h3>`;
        
        if (currentQuestion.isOpenEnded) {
            // 주관식 입력 필드 생성
            questionContainer.innerHTML += `
                <textarea rows="3" cols="70" id="openEndedResponse" placeholder="답변을 입력하세요">
            `;
        } else {
            // 라디오 버튼 생성
            const optionsHtml = currentQuestion.options.map((option, index) => `
                <div>
                    <input type="radio" id="option${index}" name="options" value="${option}">
                    <label for="option${index}">${option}</label>
                </div>
            `).join('');
            
            questionContainer.innerHTML += optionsHtml; // 옵션 추가
        }
    }
    
    nextQuestion() {
        // 주관식 질문의 답변을 저장하는 로직 추가
        if (this.questions[this.currentQuestionIndex].isOpenEnded) {
            const response = document.getElementById('openEndedResponse').value;
            console.log(`답변 (${this.currentQuestionIndex + 1}): ${response}`); // 콘솔에 답변 출력
            // 여기에서 답변을 저장하는 로직을 추가할 수 있습니다.
        }
        
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.questions.length) {
            this.showQuestion();
            this.dropDomino(); // 도미노 떨어뜨리기
        } else {
            const questionContainer = document.getElementById('questionContainer');
            questionContainer.innerHTML = "<h2>설문조사가 완료되었습니다. 감사합니다!</h2>";
            document.getElementById('nextButton').style.display = 'none'; // '다음' 버튼 숨기기
        }
    }
    

    dropDomino() {
        const floorSize = 2.5;
    
        const randomX = (Math.random() - 0.5) * floorSize * 2;
        const randomZ = (Math.random() - 0.5) * floorSize * 2;
    
        const newDomino = this._createDomino();
        newDomino.position.set(randomX, 5, randomZ);
    
        // 도미노의 무작위 회전 설정
        newDomino.rotation.x = Math.PI * Math.random(); // X축 회전
        newDomino.rotation.y = Math.PI * Math.random(); // Y축 회전
        newDomino.rotation.z = Math.PI * Math.random(); // Z축 회전
    
        this._scene.add(newDomino);
    
        // 도미노 물리 바디 생성
        const dominoBody = new CANNON.Body({
            mass: 1, // 질량 설정
            position: new CANNON.Vec3(randomX, 5, randomZ), // 초기 위치
        });
        dominoBody.addShape(new CANNON.Box(new CANNON.Vec3(0.1, 0.25, 0.1))); // 도미노 형태 설정
        dominoBody.restitution = 0.2; // 튕김 정도 설정 (0: 안 튕김, 1: 완전 튕김)
        this.physicsWorld.addBody(dominoBody);
    
        // 무작위 힘 적용 (힘을 더 줄임)
        const forceX = (Math.random() - 0.2) * 0.2; // -0.25에서 0.25 사이의 힘
        const forceY = (Math.random() - 0.2) * 0.2; // -0.25에서 0.25 사이의 힘
        dominoBody.applyImpulse(new CANNON.Vec3(forceX, forceY, 0), dominoBody.position);
    
        // 애니메이션 시작
        this.animateDominoFall(newDomino, dominoBody);
    }

    _createDomino() {
        const dominoWidth = 0.1; // 도미노 폭
        const dominoHeight = 0.5; // 도미노 높이
        const dominoDepth = 0.2; // 도미노 깊이
        const geometry = new THREE.BoxGeometry(dominoWidth, dominoHeight, dominoDepth);
        const material = new THREE.MeshPhongMaterial({ color: 0x44a88 });
        return new THREE.Mesh(geometry, material);
    }

    animateDominoFall(dominoMesh, dominoBody) {
        function update() {
            // Cannon.js 물리 업데이트
            this.physicsWorld.step(1 / 60);
            dominoMesh.position.copy(dominoBody.position);
            dominoMesh.quaternion.copy(dominoBody.quaternion);

            if (dominoMesh.position.y > 0) {
                requestAnimationFrame(update.bind(this)); // 계속 업데이트
            } else {
                dominoMesh.position.y = 0; // 바닥에 닿으면 위치 고정
            }
        }
        update.call(this); // 애니메이션 시작
    }

    _setupCamera() {
        const width = this._divContainer.clientWidth;
        const height = this._divContainer.clientHeight;
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 1, 3);
        camera.lookAt(0, 0, 0);
        this._camera = camera;
    }

    _setupLight() {
        const color = 0xffffff;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        this._scene.add(light);
    }

    _setupModel() {
        // 바닥 생성
        const floorGeometry = new THREE.PlaneGeometry(7, 6); // 크기 조정 가능
        const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x888888, side: THREE.DoubleSide });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2; // 바닥을 수평으로 회전
        this._scene.add(floor);
    
        // 바닥의 물리 바디 생성
        const floorBody = new CANNON.Body({
            type: CANNON.Body.STATIC, // 정적 물체
        });
        floorBody.addShape(new CANNON.Plane()); // 바닥 형태
        floorBody.position.copy(floor.position);
        floorBody.quaternion.copy(floor.quaternion);
        this.physicsWorld.addBody(floorBody); // this.physicsWorld가 초기화된 후에 호출
    }

    resize() {
        const width = this._divContainer.clientWidth;
        const height = this._divContainer.clientHeight;

        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();

        this._renderer.setSize(width, height);
    }

    render(time) {
        this.physicsWorld.step(1 / 60); // 물리 세계 업데이트
        this._renderer.render(this._scene, this._camera);
        requestAnimationFrame(this.render.bind(this));
    }
}

window.onload = function() {
    const app = new App();
    document.getElementById('nextButton').addEventListener('click', function() {
        app.nextQuestion(); // 다음 질문으로 이동
    });
}
