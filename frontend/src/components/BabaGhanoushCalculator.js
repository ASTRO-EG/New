import React, { useState, useEffect } from 'react';
import { Calculator, ChefHat, History, Settings, Plus, Edit, Trash2, Save, X, Utensils } from 'lucide-react';

const BabaGhanoushCalculator = () => {
  // State management
  const [quantity, setQuantity] = useState('');
  const [portions, setPortions] = useState(3);
  const [ingredients, setIngredients] = useState({
    "طحينة": 22.0,
    "ليمون": 6.5,
    "ثوم": 0.750,
    "كمون": 0.800,
    "ملح": 1.400,
    "شطة": 0.120
  });
  const [result, setResult] = useState(null);
  const [showIngredientsModal, setShowIngredientsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientAmount, setNewIngredientAmount] = useState('');
  const [changesHistory, setChangesHistory] = useState([]);
  const [calculationsHistory, setCalculationsHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('changes');
  const [darkMode, setDarkMode] = useState(false);

  const ingredientIcons = {
    "طحينة": "⚪",
    "ليمون": "🍋",
    "ثوم": "🧄",
    "كمون": "🌿",
    "ملح": "🧂",
    "شطة": "🌶️",
    "زبادي": "🥛"
  };

  const yogurtPer100Kg = 30;

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedIngredients = localStorage.getItem('baba_ghanoush_ingredients');
    const savedChanges = localStorage.getItem('baba_ghanoush_changes_history');
    const savedCalculations = localStorage.getItem('baba_ghanoush_calculations_history');

    if (savedIngredients) {
      setIngredients(JSON.parse(savedIngredients));
    }
    if (savedChanges) {
      setChangesHistory(JSON.parse(savedChanges));
    }
    if (savedCalculations) {
      setCalculationsHistory(JSON.parse(savedCalculations));
    }
  }, []);

  const calculate = () => {
    const qty = parseFloat(quantity);
    const port = parseInt(portions);

    if (isNaN(qty) || qty <= 0) {
      alert("❌ الرجاء إدخال كمية صحيحة أكبر من الصفر");
      return;
    }

    if (isNaN(port) || port <= 0) {
      alert("❌ الرجاء إدخال عدد حلل صحيح أكبر من الصفر");
      return;
    }

    const ratio = qty / 100;
    const yogurtBoxes = Math.round(yogurtPer100Kg * ratio * 100) / 100;

    const totalIngredients = [];
    const perPotIngredients = [];

    // Calculate total amounts
    for (let ingredient in ingredients) {
      let value = ingredients[ingredient] * ratio;
      totalIngredients.push({
        name: ingredient,
        amount: value,
        unit: value < 1 ? 'جرام' : 'كيلو',
        displayValue: value < 1 ? (value * 1000).toFixed(2) : value.toFixed(2)
      });
    }

    totalIngredients.push({
      name: 'زبادي',
      amount: yogurtBoxes,
      unit: 'علبة',
      displayValue: yogurtBoxes.toFixed(2)
    });

    // Calculate per pot amounts
    for (let ingredient in ingredients) {
      let value = (ingredients[ingredient] * ratio) / port;
      perPotIngredients.push({
        name: ingredient,
        amount: value,
        unit: value < 1 ? 'جرام' : 'كيلو',
        displayValue: value < 1 ? (value * 1000).toFixed(2) : value.toFixed(2)
      });
    }

    perPotIngredients.push({
      name: 'زبادي',
      amount: yogurtBoxes / port,
      unit: 'علبة',
      displayValue: (yogurtBoxes / port).toFixed(2)
    });

    setResult({
      quantity: qty,
      portions: port,
      total: totalIngredients,
      perPot: perPotIngredients
    });

    // Log calculation
    logCalculation(qty, port);
  };

  const logCalculation = (qty, port) => {
    const now = new Date();
    const date = now.toLocaleString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const newRecord = {
      date: date,
      action: `تم حساب مقادير ${qty} كيلو من البابا غنوج مقسمة على ${port} حلل`
    };

    const updatedHistory = [newRecord, ...calculationsHistory];
    setCalculationsHistory(updatedHistory);
    localStorage.setItem('baba_ghanoush_calculations_history', JSON.stringify(updatedHistory));
  };

  const logChange = (action) => {
    const now = new Date();
    const date = now.toLocaleString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const newRecord = {
      date: date,
      action: action
    };

    const updatedHistory = [newRecord, ...changesHistory];
    setChangesHistory(updatedHistory);
    localStorage.setItem('baba_ghanoush_changes_history', JSON.stringify(updatedHistory));
  };

  const addIngredient = () => {
    const name = newIngredientName.trim();
    const amount = parseFloat(newIngredientAmount);

    if (!name || isNaN(amount) || amount <= 0) {
      alert('الرجاء إدخال اسم مكون وكمية صحيحة');
      return;
    }

    const updatedIngredients = { ...ingredients, [name]: amount };
    setIngredients(updatedIngredients);
    
    logChange(`تم إضافة مكون جديد: ${name} - ${amount} كجم لكل 100 كيلو`);
    
    setNewIngredientName('');
    setNewIngredientAmount('');
  };

  const deleteIngredient = (ingredientName) => {
    if (window.confirm(`هل أنت متأكد من حذف "${ingredientName}"؟`)) {
      logChange(`تم حذف المكون: ${ingredientName} - ${ingredients[ingredientName]} كجم لكل 100 كيلو`);
      
      const updatedIngredients = { ...ingredients };
      delete updatedIngredients[ingredientName];
      setIngredients(updatedIngredients);
    }
  };

  const editIngredient = (ingredientName) => {
    const newName = window.prompt('الرجاء إدخال الاسم الجديد للمكون:', ingredientName);
    if (!newName) return;

    const newAmount = parseFloat(window.prompt('الرجاء إدخال الكمية الجديدة لكل 100 كيلو:', ingredients[ingredientName]));
    if (isNaN(newAmount)) return;

    logChange(`تم تعديل المكون من "${ingredientName}" إلى "${newName}" والكمية من ${ingredients[ingredientName]} إلى ${newAmount}`);

    const updatedIngredients = { ...ingredients };
    delete updatedIngredients[ingredientName];
    updatedIngredients[newName] = newAmount;
    setIngredients(updatedIngredients);
  };

  const saveIngredients = () => {
    localStorage.setItem('baba_ghanoush_ingredients', JSON.stringify(ingredients));
    logChange('تم حفظ جميع التغييرات على المكونات');
    alert('تم حفظ التغييرات بنجاح!');
    setShowIngredientsModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4 font-arabic" dir="rtl">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-6 border border-orange-100">
          <div className="text-center">
            {/* Logo */}
            <div className="relative inline-block mb-6">
              <div className="w-28 h-28 bg-gradient-to-br from-orange-400 to-red-500 rounded-full p-1 shadow-xl">
                <img 
                  src="https://i.ibb.co/cHrQjBG/logo.jpg" 
                  alt="كافتيريا أبو حيدر" 
                  className="w-full h-full rounded-full object-cover bg-white p-1"
                />
              </div>
              <div className="absolute -top-2 -left-2 w-32 h-32 bg-gradient-to-br from-orange-300/30 to-red-400/30 rounded-full blur-xl"></div>
            </div>
            
            {/* Title */}
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
              حاسبة مقادير بابا غنوج
            </h1>
            
            {/* Description */}
            <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
              أدخل الكمية المطلوبة وعدد الحلل، وسنقوم بحساب جميع المقادير اللازمة لك بدقة متناهية
            </p>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-6 border border-orange-100">
          {/* Quantity Input */}
          <div className="mb-6">
            <label className="block text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-orange-500" />
              الكمية المطلوبة (كيلوجرام)
            </label>
            <div className="relative">
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                step="0.1"
                placeholder="مثال: 50"
                className="w-full pl-16 pr-4 py-4 text-lg font-bold bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all duration-300 shadow-inner"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">
                كجم
              </span>
            </div>
          </div>

          {/* Portions Input */}
          <div className="mb-6">
            <div className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 border-2 border-orange-200">
              <div className="flex items-center gap-3">
                <Utensils className="w-5 h-5 text-orange-500" />
                <span className="text-lg font-bold text-gray-700">عدد الحلل:</span>
              </div>
              <input
                type="number"
                value={portions}
                onChange={(e) => setPortions(parseInt(e.target.value))}
                min="1"
                className="w-20 px-3 py-2 text-lg font-bold text-center bg-white border-2 border-orange-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none shadow-inner"
              />
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculate}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xl font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group"
          >
            <Calculator className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
            احسب المقادير الآن
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-6 border border-orange-100 animate-fade-in">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <ChefHat className="w-6 h-6 text-orange-500" />
              المقادير المطلوبة لـ {result.quantity} كيلو بابا غنوج
            </h3>
            
            <div className="grid gap-4 mb-8">
              {result.total.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ingredientIcons[item.name] || '🌿'}</span>
                    <span className="text-lg font-bold text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-lg font-bold text-orange-600 bg-white px-3 py-1 rounded-lg shadow-sm">
                    {item.displayValue} {item.unit}
                  </span>
                </div>
              ))}
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Utensils className="w-6 h-6 text-orange-500" />
              المقادير لكل حلة ({result.portions} حلل)
            </h3>
            
            <div className="grid gap-4">
              {result.perPot.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ingredientIcons[item.name] || '🌿'}</span>
                    <span className="text-lg font-bold text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600 bg-white px-3 py-1 rounded-lg shadow-sm">
                    {item.displayValue} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 mb-6 border border-orange-100">
          <div className="flex gap-4">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <History className="w-5 h-5" />
              سجل التغييرات
            </button>
            <button
              onClick={() => setShowIngredientsModal(true)}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Settings className="w-5 h-5" />
              إدارة المكونات
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 py-4">
          <p className="font-bold">© كافتيريا أبو حيدر | تأسست ١٩٦٠ | جميع الحقوق محفوظة</p>
        </div>
      </div>

      {/* Ingredients Modal */}
      {showIngredientsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <Settings className="w-6 h-6 text-purple-500" />
                  إدارة مكونات بابا غنوج
                </h2>
                <button
                  onClick={() => setShowIngredientsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Add Ingredient Form */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-6 border border-purple-200">
                <div className="grid gap-4 md:grid-cols-3">
                  <input
                    type="text"
                    value={newIngredientName}
                    onChange={(e) => setNewIngredientName(e.target.value)}
                    placeholder="اسم المكون (مثال: زيت زيتون)"
                    className="px-4 py-3 bg-white border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none"
                  />
                  <input
                    type="number"
                    value={newIngredientAmount}
                    onChange={(e) => setNewIngredientAmount(e.target.value)}
                    placeholder="الكمية لكل 100 كيلو"
                    step="0.001"
                    className="px-4 py-3 bg-white border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none"
                  />
                  <button
                    onClick={addIngredient}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    إضافة مكون
                  </button>
                </div>
              </div>

              {/* Ingredients List */}
              <div className="space-y-4 mb-6">
                {Object.entries(ingredients).map(([name, amount]) => (
                  <div key={name} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{ingredientIcons[name] || '🌿'}</span>
                        <div>
                          <div className="font-bold text-gray-800">{name}</div>
                          <div className="text-sm text-gray-600">{amount} كجم لكل 100 كيلو</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editIngredient(name)}
                          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteIngredient(name)}
                          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Save Button */}
              <button
                onClick={saveIngredients}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <History className="w-6 h-6 text-blue-500" />
                  سجل التغييرات
                </h2>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              
              {/* Tabs */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setActiveTab('changes')}
                  className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 ${
                    activeTab === 'changes'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  تعديلات المكونات
                </button>
                <button
                  onClick={() => setActiveTab('calculations')}
                  className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 ${
                    activeTab === 'calculations'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  عمليات الحساب
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {activeTab === 'changes' ? (
                <div className="space-y-4">
                  {changesHistory.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">لا توجد تغييرات مسجلة</p>
                  ) : (
                    changesHistory.map((record, index) => (
                      <div key={index} className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-200">
                        <div className="font-bold text-orange-600 mb-2">{record.date}</div>
                        <div className="text-gray-700">{record.action}</div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {calculationsHistory.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">لا توجد عمليات حساب مسجلة</p>
                  ) : (
                    calculationsHistory.map((record, index) => (
                      <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
                        <div className="font-bold text-blue-600 mb-2">{record.date}</div>
                        <div className="text-gray-700">{record.action}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BabaGhanoushCalculator;