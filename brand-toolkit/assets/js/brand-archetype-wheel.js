/**
 * Brand Archetype Wheel Logic
 * Handles the 12-archetype interaction and automatic personality generation.
 */

const ARCHETYPE_DATA = {
    innocent: {
        title: "天真者 (Innocent)",
        desc: "纯真、乐观、简单",
        desire: "体验天堂，获得幸福",
        fear: "因为做了错事或坏事而被惩罚",
        strategy: "做正确的事",
        examples: "可口可乐, 多芬 (Dove), 依云",
        personality: "我们的品牌核心是简单而纯粹的。我们追求乐观主义，相信生活应该是快乐且透明的。我们避免复杂，用最真诚的方式与客户沟通。"
    },
    sage: {
        title: "智者 (Sage)",
        desc: "智慧、真理、专业",
        desire: "发现真理，利用智慧理解世界",
        fear: "被误导、无知、被骗",
        strategy: "寻求信息和知识；自我反省和理解思考过程",
        examples: "Google, BBC, 经济学人, TED",
        personality: "我们是知识的传播者和事实的守护者。我们相信数据和逻辑的力量，致力于通过专业见解帮助客户理清混乱，发现真相。"
    },
    explorer: {
        title: "探险家 (Explorer)",
        desc: "自由、冒险、发现",
        desire: "通过探索世界发现自己是谁",
        fear: "感到受困、顺从、内心空虚",
        strategy: "旅行、寻找和体验新事物、逃避无聊",
        examples: "Jeep, The North Face, 帕塔哥尼亚 (Patagonia)",
        personality: "我们不满足于现状。我们的品牌鼓励客户打破边界，去探索未知的领域。我们追求自由与独立，是每一场精彩旅程的陪伴者。"
    },
    outlaw: {
        title: "叛逆者 (Outlaw)",
        desc: "革命、打破常规、自由",
        desire: "报复或革命，打破无效的事物",
        fear: "无能为力或平庸",
        strategy: "破坏、扰乱或令人震惊",
        examples: "哈雷戴维森 (Harley-Davidson), 维珍 (Virgin), Apple (1984时期)",
        personality: "我们是规则的破坏者。我们代表那些敢于挑战现状、拒绝平庸的灵魂。我们的价值观是颠覆性的，致力于通过创新实现彻底的变革。"
    },
    magician: {
        title: "魔术师 (Magician)",
        desc: "转化、创新、梦想",
        desire: "了解世界的运作基本定律，让梦想成真",
        fear: "意想不到的负面后果",
        strategy: "发展愿景并以此生活",
        examples: "Apple, 迪士尼 (Disney), 戴森 (Dyson)",
        personality: "我们将不可能变为可能。我们的品牌充满了奇迹感和技术深度。我们不只是提供产品，我们提供的是一种能够改变客户生活方式的“魔法”。"
    },
    hero: {
        title: "英雄 (Hero)",
        desc: "勇气、成就、卓越",
        desire: "通过勇敢的行动证明自己的价值",
        fear: "软弱、脆弱、成为“牺牲品”",
        strategy: "变得尽可能强大和有能力",
        examples: "Nike, FedEx, 阿迪达斯",
        personality: "核心是意志力和竞争力。我们相信每个人都有成为英雄的潜力。我们提供最好的工具，帮助客户在挑战面前保持强悍，赢得胜利。"
    },
    lover: {
        title: "情人 (Lover)",
        desc: "激情、亲密、感官",
        desire: "实现亲密关系，体验愉悦",
        fear: "孤独、不被爱、被人嫌弃",
        strategy: "在情感和身体上变得越来越有吸引力",
        examples: "Chanel, 维多利亚的秘密, 梦龙 (Magnum)",
        personality: "我们追求极致的美学和感官上的愉悦。我们的品牌是性感且充满诱惑力的，我们致力于帮客户建立深层的情感连接，提升生活的品质感。"
    },
    jester: {
        title: "小丑 (Jester)",
        desc: "幽默、快乐、玩乐",
        desire: "活在当下，享受生活满分快乐",
        fear: "无聊或让人觉得无趣",
        strategy: "玩耍，开玩笑，变得有趣",
        examples: "M&M's, Old Spice, 汉堡王",
        personality: "生活不应该太严肃。我们是快乐的催化剂，用幽默感和创意打破沉闷。我们鼓励客户享受当下，用最有趣的方式看待世界。"
    },
    everyman: {
        title: "凡人 (Everyman)",
        desc: "归属、真实、可靠",
        desire: "与他人建立联系，融入群体",
        fear: "脱颖而出、摆架子、被排斥",
        strategy: "培养普通的、坚实的价值观，保持低调",
        examples: "IKEA, Levi's, 亚马逊 (早期)",
        personality: "我们就和你一样。我们的品牌基于常识和实用主义，拒绝虚伪。我们致力于提供每个人都负担得起、且能真实解决问题的可靠产品。"
    },
    caregiver: {
        title: "照顾者 (Caregiver)",
        desc: "关怀、保护、利他",
        desire: "保护和照顾他人",
        fear: "自私和忘恩负义",
        strategy: "为他人做事",
        examples: "强生 (Johnson & Johnson), 沃尔沃 (Volvo), 联合利华",
        personality: "安全和呵护是我们的承诺。我们的品牌像一位可靠的长辈，时刻关怀着客户的福祉。我们所做的一切都是为了保护你所珍视的事物。"
    },
    ruler: {
        title: "统治者 (Ruler)",
        desc: "权威、秩序、领导力",
        desire: "控制，创造一个成功的家庭、公司或社会",
        fear: "混乱，被推翻",
        strategy: "行使领导权",
        examples: "劳力士 (Rolex), 奔驰 (Mercedes-Benz), 微软",
        personality: "我们定义标准，维护秩序。我们的品牌代表了顶级的品质和不可动摇的地位。我们为那些引领时代的成功者提供最卓越的支撑。"
    },
    creator: {
        title: "创造者 (Creator)",
        desc: "想象、表达、独创",
        desire: "创造具有持久价值的事物",
        fear: "平庸的视角和表现，甚至变得平淡",
        strategy: "发展艺术技能和控制力",
        examples: "Lego, Adobe, Pinterest",
        personality: "我们的使命是激发你的创造潜力。我们提供无限可能的画布，鼓励客户将想象力变为现实。每一个独创的想法都值得被更好地表达。"
    }
};

let currentSelectedArchetype = null;

document.addEventListener('DOMContentLoaded', () => {
    const slices = document.querySelectorAll('.wheel-slice');
    const infoPlaceholder = document.querySelector('.info-placeholder');
    const infoContent = document.querySelector('.info-content');
    const btnSelect = document.getElementById('btnSelectPrimary');

    slices.forEach(slice => {
        slice.addEventListener('click', () => {
            const key = slice.getAttribute('data-archetype');
            currentSelectedArchetype = key;

            // UI Logic
            slices.forEach(s => s.classList.remove('active'));
            slice.classList.add('active');

            showDetails(key);
        });
    });

    btnSelect.addEventListener('click', () => {
        if (!currentSelectedArchetype) return;

        const data = ARCHETYPE_DATA[currentSelectedArchetype];

        // Fill the form fields
        const primaryInput = document.querySelector('[data-save-key="primary_archetype"]');
        const personalityTextarea = document.querySelector('[data-save-key="personality_desc"]');

        if (primaryInput) primaryInput.value = data.title;
        if (personalityTextarea) personalityTextarea.value = data.personality;

        // Visual Feedback
        btnSelect.textContent = "已设为主要 (Selected)";
        btnSelect.style.background = "var(--color-semantic-success, #10B981)";

        setTimeout(() => {
            btnSelect.textContent = "设定为主要原型";
            btnSelect.style.background = "";
        }, 1500);

        // Auto-save via ModiqiApp
        if (window.modiqiApp) {
            window.modiqiApp.saveAllItems();
            window.modiqiApp.syncWithClipboard();
        }
    });
});

function showDetails(key) {
    const data = ARCHETYPE_DATA[key];
    if (!data) return;

    const infoPlaceholder = document.querySelector('.info-placeholder');
    const infoContent = document.querySelector('.info-content');

    infoPlaceholder.style.display = 'none';
    infoContent.style.display = 'flex';

    document.getElementById('infoTitle').textContent = data.title;
    document.getElementById('infoDesc').textContent = data.desc;
    document.getElementById('infoDesire').textContent = data.desire;
    document.getElementById('infoFear').textContent = data.fear;
    document.getElementById('infoStrategy').textContent = data.strategy;
    document.getElementById('infoExamples').textContent = data.examples;
}
