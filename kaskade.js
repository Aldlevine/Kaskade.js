window.$k = window.kaskade = (function(){
  
  /** OBJECT AUGMENTATION **/
  Object.isEqual = function(a, b){
    if(Object.keys(a).length == Object.keys(b).length){
      for(var k in a){
        if(a[k] !== b[k])
          return false;
        return true;
      }
    }
    return false;
  };
  /** /OBJECT AUGMENTATION **/
  
  
  
  
  
  /** ARRAY AUGMENTATION **/
  Array.prototype.remove = function(element){
    var index = this.indexOf(element);
    if(index >= 0)
      this.splice(index,1);
    return index;
  };
  Array.prototype.add = function(element){
    if(this.indexOf(element) < 0)
      this.push(element);
  };
  Array.prototype.last = function(){
    return this[this.length - 1];
  };
  Array.prototype.clone = function(){
    return this.slice(0);
  };
  Object.defineProperties(
    Array.prototype,
    {
      remove: {enumerable: false},
      add: {enumerable: false},
      last: {enumerable: false},
      clone: {enumerable: false}
    }
  );
  /** /ARRAY AUGMENTATION **/
  
  
  
  
  
  /** STRING AUGMENTATION **/
  String.prototype.camelCase = function(){
    var arr = this.split('-');
    for(var i=1, len=arr.length; i<len; i++){
      arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
    }
    return arr.join('');
  };
  /** /STRING AUGMENTATION **/
  
  
  
  
  /** HTMLELEMENT AUGMENTATION **/
  
  /** ADDEVENTHANDLER **/
  HTMLElement.prototype.addEventHandler = function(events, callback){
    if(!(events instanceof Array))
      events = [events];
    for(var i=0, len=events.length; i<len; i++){
      if(this.addEventListener){
        this.addEventListener(events[i], callback, false);
      }else{
        this.attachEvent('on'+events[i], callback);
        this.attachEvent(events[i], callback);
      }
    }
  };
  /** /ADDEVENTHANDLER **/
  
  /** DATASET SHIM **/
  HTMLElement.prototype.getDataset = function(){
    if(this.dataset) return this.dataset;
    
    function DomStringMap(){};
    var dataset = new DomStringMap();
    
    [].filter.call(this.attributes, function(element){
      
      if( /^data-/.test(element.nodeName) ){
        
        var key = element.name || element.nodeName,
            value = element.value || element.nodeValue;
        
        key = key.replace(/^data-/, '').camelCase();
        dataset[key] = value;
        
      }
      
    });
    
    return dataset;
  };
  /** /DATASET SHIM **/
  
  /** CLASSLIST SHIM **/
  (function(){
    if (typeof window.Element === "undefined" || "classList" in document.documentElement) return;

    var prototype = Array.prototype,
        push = prototype.push,
        splice = prototype.splice,
        join = prototype.join;

    function DOMTokenList(el) {
      this.el = el;
      // The className needs to be trimmed and split on whitespace
      // to retrieve a list of classes.
      var classes = el.className.replace(/^\s+|\s+$/g,'').split(/\s+/);
      for (var i = 0; i < classes.length; i++) {
        push.call(this, classes[i]);
      }
    };

    DOMTokenList.prototype = {
      add: function(token) {
        if(this.contains(token)) return;
        push.call(this, token);
        this.el.className = this.toString();
      },
      contains: function(token) {
        return this.el.className.indexOf(token) != -1;
      },
      item: function(index) {
        return this[index] || null;
      },
      remove: function(token) {
        if (!this.contains(token)) return;
        for (var i = 0; i < this.length; i++) {
          if (this[i] == token) break;
        }
        splice.call(this, i, 1);
        this.el.className = this.toString();
      },
      toString: function() {
        return join.call(this, ' ');
      },
      toggle: function(token) {
        if (!this.contains(token)) {
          this.add(token);
        } else {
          this.remove(token);
        }

        return this.contains(token);
      }
    };

    window.DOMTokenList = DOMTokenList;

    function defineElementGetter (obj, prop, getter) {
      if (Object.defineProperty) {
        Object.defineProperty(obj, prop,{
          get : getter
        });
      } else {
        obj.__defineGetter__(prop, getter);
      }
    }

    defineElementGetter(Element.prototype, 'classList', function () {
      return new DOMTokenList(this);
    });
  })();
  /** /CLASSLIST SHIM **/
  
  /** /HTMLELEMENT AUGMENTATION **/
  
  
  
  
  /** Kaskade **/
  var Kaskade = function Kaskade(){};
  Kaskade.prototype.constructor = Kaskade;
  
  Kaskade.prototype.get = function(obj){
    if(obj instanceof Kaskade.prototype.Routine)
      return obj.value;
    else
      return obj;
  };
  /** /Kaskade **/
  
  
  
  
  
  /** KLASS **/
  Kaskade.prototype.klass = (function __klass__(){
    var klass = function klass(name, dynamic, stat){
      
      /*var __KLASS__ = (new Function(
        'return function '+name+'(cfg){'+
          'for(var p in this){'+
            'if(this[p] && p!=="$super")this[p].$parent = this;'+
          '}'+
          'for(var c in cfg){'+
            'if(c in this) this[c] = cfg[c];'+
          '}'+
        '}'
      ))();*/
      var __KLASS__ = function (cfg){
        cfg = cfg || {};
        if(this.init && this.init instanceof Function)
          this.init.call(this);
        for(var p in this){
          if(this[p] instanceof Kaskade.prototype.Routine) cfg[p] = new Kaskade.prototype.Routine(this[p].method);
          /*else if(this[p] instanceof Kaskade.prototype.List) cfg[p] = new Kaskade.prototype.List(this[p].array);*/
          if(this[p] && p!="$super")this[p].$parent = this;
        }
        for(var c in cfg){
          if(c in this) this[c] = cfg[c];
          if(this[c]) this[c].$parent = this;
        }
      };
      
      // Apply Static Properties
      for(var s in stat)
        __KLASS__[s] = stat[s];
      
      __KLASS__.$extend = function(name, dynamic, stat){
        var dynamic = dynamic || {},
            stat = stat || {};
        for(var p in __KLASS__.prototype){
          dynamic[p] = dynamic[p] || __KLASS__.prototype[p];
        }
        for(var p in __KLASS__){
          stat[p] = stat[p] || __KLASS__[p];
        }
        stat.$name = name;
        dynamic.$name = name;
        stat.$super = __KLASS__.prototype;
        dynamic.$super = __KLASS__.prototype;
        return klass(name, dynamic, stat);
      };
      
      // Prototype
      __KLASS__.prototype.constructor = __KLASS__;
      __KLASS__.prototype.$name = name;
      __KLASS__.prototype.$trackers = {};
      __KLASS__.prototype.$track = function(property, callback){
        var trackers = this.$trackers[property] || [];
        trackers.add(callback);
        this.$trackers[property] = trackers;
        
        if(this[property] instanceof Kaskade.prototype.List){
          this[property].$track(callback);
        }
      };
      __KLASS__.prototype.$notify = function(property){
        var trackers = this.$trackers[property] || [];
        for(var i=0, len=trackers.length; i<len; i++){
          if(trackers[i] instanceof Function)
            trackers[i](this, property);
        }
      };
      
      __KLASS__.prototype.$instanceof = function(name){
        var $super = this;
        while($super){
          if($super.$name == name)
            return true;
          $super = $super.$super;
        }
        return false;
      };
      
      Object.defineProperty(
        __KLASS__.prototype, '$parents',
        {
          get: function(){
            var stack = [],
                $parent = this.$parent;
            while($parent){
              stack.push($parent);
              $parent = $parent.$parent;
            }
            return stack;
          }
        }
      );
      
      Object.defineProperty(
        __KLASS__.prototype, '$root',
        {
          get: function(){
            return this.$parents.last() || this;
          }
        }
      );
      
      // Apply Prototype Properties
      // These properties get special attention in their setters
      for(var d in dynamic){
        (function(d){
          if(!/^\$/.test(d) && !/^__.+__$/.test(d)){
            __KLASS__.prototype[d] = dynamic[d];
            __KLASS__.prototype['__'+d+'__'] = dynamic[d];
            Object.defineProperty(
              __KLASS__.prototype, d,
              {
                get: function(){
                  Kaskade.prototype.DependencyTracker.addDependency(this, d);
                  return this['__'+d+'__'];
                },
                set: function(value){
                  if(value) value.$parent = this;
                  this['__'+d+'__'] = value;
                  this.$notify(d);
                }
              }
            );

          }
        })(d);
      }
      
      return __KLASS__;
      
    };
    return klass;
  })();
  /** /KLASS **/
  
  
  
  
  
  /** DEPENDENCY_TRACKER **/
  Kaskade.prototype.DependencyTracker = (function __DEPENDENCY_TRACKER__(){
    var DependencyTracker = function DependencyTracker(){
      this.dependencies = [];
    };
    
    DependencyTracker.dependencyTrackerStack = [];
    DependencyTracker.addDependency = function(context, prop){
      for(var i=0, len=DependencyTracker.dependencyTrackerStack.length; i<len; i++){
        DependencyTracker.dependencyTrackerStack[i].add(context, prop);
      }
    };
    
    //DependencyTracker.prototype.dependencies = [];
    
    DependencyTracker.prototype.begin = function(){
      DependencyTracker.dependencyTrackerStack.add(this);
    };
    
    DependencyTracker.prototype.add = function(context, prop){
      var dep = {context: context, prop: prop};
      this.dependencies.add(dep);
    };
    
    DependencyTracker.prototype.done = function(){
      DependencyTracker.dependencyTrackerStack.remove(this);
      return this.dependencies;
    };
    
    return DependencyTracker;
  })();
  /** /DEPENDENCY-TRACKER **/
  
  
  
  
  
  /** ROUTINE **/
  Kaskade.prototype.Routine = (function __ROUTINE__(){
    var Routine = function(method){
      this.method = method;//.bind(this);
      Object.getPrototypeOf(this).constructor.routineStack.add(this);
    };
    
    Routine.routineStack = [];
    Routine.begin = function(){
      for(var i=0, len=Routine.routineStack.length; i<len; i++){
        Routine.routineStack[i].begin();
      }
    };
    
    Object.defineProperty(
      Routine.prototype, 'value',
      {
        get: function(){ if(this.ready) return this.method.call(this); }
      }
    );
    
    Routine.prototype.ready = false;
    
    Routine.prototype.begin = function(){
      var dependencyTracker = new Kaskade.prototype.DependencyTracker();
      dependencyTracker.begin();
      this.method();
      var dependencies = dependencyTracker.done();
            
      for(var i=0, len=dependencies.length; i<len; i++){
        var dep = dependencies[i];
        dep.context.$track(dep.prop, this.$notify.bind(this));
      }
      
      Routine.prototype.ready = true;
    };
    
    Object.defineProperty(
      Routine.prototype, '$parents',
      {
        get: function(){
          var stack = [],
              $parent = this.$parent;
          while($parent){
            stack.push($parent);
            $parent = $parent.$parent;
          }
          return stack;
        }
      }
    );

    Object.defineProperty(
      Routine.prototype, '$root',
      {
        get: function(){
          return this.$parents.last() || this;
        }
      }
    );
    
    Routine.prototype.$trackers = [];
    Routine.prototype.$track = function(callback){
      var trackers = this.$trackers || [];
      trackers.add(callback);
      this.$trackers = trackers;
    };
    Routine.prototype.$notify = function(){
      var trackers = this.$trackers || [];
      for(var i=0, len=trackers.length; i<len; i++){
        if(trackers[i] instanceof Function)
          trackers[i](this, 'value');
      }
    };
    
    return Routine;
  })();
  /** /ROUTINE **/
  
  
  
  
  /** LIST **/
  Kaskade.prototype.List = (function __LIST__(){
    var List = function(array){
      this.array = array || [];
      this.$trackers = [];
      for(var i=0, len=array.length; i<len; i++){
        array[i].$parent = this;
      }
    };
    
    List.prototype.constructor = List;
    
    List.prototype.$push = function(value){
      value.$parent = this;
      this.array.push(value);
      this.$notify('push', value);
    };
    
    List.prototype.$pop = function(){
      var value = this.array.pop();
      this.$notify('pop', value);
      return value;
    };
    
    List.prototype.$remove = function(value){
      var value = this.array.remove(value);
      this.$notify('remove', value);
      return value;
    };
    
    Object.defineProperty(
      List.prototype, '$parents',
      {
        get: function(){
          var stack = [],
              $parent = this.$parent;
          while($parent){
            stack.push($parent);
            $parent = $parent.$parent;
          }
          return stack;
        }
      }
    );

    Object.defineProperty(
      List.prototype, '$root',
      {
        get: function(){
          return this.$parents.last() || this;
        }
      }
    );
    
    List.prototype.$trackers = [];
    List.prototype.$track = function(callback){
      var trackers = this.$trackers || [];
      trackers.add(callback);
      this.$trackers = trackers;
    };
    List.prototype.$notify = function(type, value){
      var trackers = this.$trackers || [];
      for(var i=0, len=trackers.length; i<len; i++){
        if(trackers[i] instanceof Function)
          trackers[i](type, value);
      }
    };
        
    return List;
  })();
  /** /LIST **/
  
  
  
  
  /** BINDING-MANAGER **/
  Kaskade.prototype.BindingManager = (function __BINDING_MANAGER__(){
    var BindingManager = function(cfg){
      
      this.element = null;
      this.property = null;
      this.context = null;
      this.name = null;
      this.type = null;

      this.template = null;
      this.placeHolder = null;
      this.listStack = [];
      this.onAdd = function(nodes, done){done()};
      this.onRemove = function(nodes, done){done()};
      
      for(var c in cfg)
        if(c in this) this[c] = cfg[c];
    };
    
    BindingManager.bindings = {};
    BindingManager.parseBindings = function(bindings){
      var parsedBindings = [];
      for(var b in bindings){
        
        if(/:/.test(bindings[b])){//We have a grouped binding
          
          var bindingMap = bindings[b].split(/[\s,]+/);
          for(var i=0, len=bindingMap.length; i<len; i++){
            (function(i){
              var split = bindingMap[i].split(':'),
                  name = b,
                  type = split[0],
                  property = split[1];
              parsedBindings.push({name: name, property: property, type:type});
            })(i);
          }
        }
        else//We have a single binding
          parsedBindings.push({name: b, property: bindings[b]});
        
      }
      return parsedBindings;
    };
    BindingManager.processBindings = function(element, context){
      var bindings = BindingManager.parseBindings(element.getDataset()),
          originalContext = context,
          
          listIndex = 0;
      for(var i=0, len=bindings.length; i<len; i++){
        (function(i){
          if(/^\{(.+)\}/.test(bindings[i].property)){
            var value = bindings[i].property.replace(/^\{(.+)\}/, '$1');
            element.setAttribute('data-'+bindings[i].name, '__raw__'+bindings[i].name);
            bindings[i].property = '__raw__'+bindings[i].name;
            context['__raw__'+bindings[i].name] = value;
          }

          if(/^\[(.+)\]/.test(bindings[i].property)){
            var valueAccessor = bindings[i].property.replace(/^\[(.+)\]/, '$1'),
                split = valueAccessor.split(/[\.\[\]"\']/);
            split = split.filter(function(element){
              return element.length > 0;
            });
            var prop = split.shift();
            while(split.length){
              context = (new Function('context', 'with(context){return context['+prop+'] || '+prop+'}'))(context);
              prop = split.shift();
            }
            bindings[i].property = prop;
          }
          var bindingManager = new Kaskade.prototype.BindingManager({
            element: element,
            context: context,
            property: bindings[i].property,
            name: bindings[i].name,
            type: bindings[i].type
          });
          bindingManager.applyBinding();
        })(i);
        context = originalContext;
      }
    };
    
    BindingManager.prototype.constructor = BindingManager;
    /*BindingManager.prototype.element = null;
    BindingManager.prototype.property = null;
    BindingManager.prototype.context = null;
    BindingManager.prototype.name = null;
    BindingManager.prototype.type = null;
    
    BindingManager.prototype.template = null;
    BindingManager.prototype.placeHolder = null;
    BindingManager.prototype.listStack = [];*/
    
    BindingManager.prototype.applyBinding = function(){
      var stat = Object.getPrototypeOf(this).constructor;
      
      //INIT
      if(this.context[this.property] instanceof Kaskade.prototype.Routine){
        stat.bindings[this.name].init.call(this, this.element, this.context[this.property], 'value', this.type);
      }else{
        stat.bindings[this.name].init.call(this, this.element, this.context, this.property, this.type);
      }
      
      //UPDATE
      if(this.context[this.property] instanceof Kaskade.prototype.Routine){
        this.context[this.property].$track(stat.bindings[this.name].update.bind(this, this.element, this.context[this.property], 'value', this.type));
      }
      else if(this.context[this.property] instanceof Kaskade.prototype.List){
        this.context[this.property].$track(stat.bindings[this.name].update.bind(this, this.element, this.context[this.property]));
      }
      else if(this.context.$track){
          this.context.$track(this.property, stat.bindings[this.name].update.bind(this, this.element, this.context, this.property, this.type));
      }
      
    };
    
    return BindingManager;
  })();
  /** /BINDING-MANAGER **/
  /** BINDINGS **/
  (function(){
    var bindings = Kaskade.prototype.BindingManager.bindings;
    
    //HTML
    bindings.html = {};
    bindings.html.init = function(element, context, property, type){
      element.innerHTML = Kaskade.prototype.get(context[property]);
    };
    bindings.html.update = bindings.html.init;
    
    //TEXT
    bindings.text = {};
    bindings.text.init = function(element, context, property, type){
      element.textContent = Kaskade.prototype.get(context[property]);
    };
    bindings.text.update = bindings.text.init;
    
    //VALUE
    bindings.value = {};
    bindings.value.update = function(element, context, property, type){
      if(element.value !== Kaskade.prototype.get(context[property]))
        element.value = Kaskade.prototype.get(context[property]);
    };
    bindings.value.init = function(element, context, property, type){
      bindings.value.update.call(this, element, context, property, type);
      element.addEventHandler(['keyup', 'change', 'input'],function(){
        context[property] = element.value;
      });
    };
    
    //CHECKED
    bindings.checked = {};
    bindings.checked.update = function(element, context, property, type){
      if(element.type == 'checkbox')
        element.checked = Kaskade.prototype.get(context[property]);
      else if(element.type == 'radio')
        element.checked = element.value == Kaskade.prototype.get(context[property]);
    };
    bindings.checked.init = function(element, context, property, type){
      bindings.checked.update.call(this, element, context, property, type);
      element.addEventHandler(['click', 'change', 'input'],function(){
        if(element.type == 'checkbox')
          context[property] = element.checked;
        else if(element.type == 'radio')
          context[property] = element.value;
      });
    };
    
    //STYLE
    bindings.style = {};
    bindings.style.init = function(element, context, property, type){
      if(!(type in element.style))
        type = 'css' + type.charAt(0).toUpperCase() + type.slice(1);
      
      element.style[type] = Kaskade.prototype.get(context[property]);
    };
    bindings.style.update = bindings.style.init;
    
    //ATTR
    bindings.attr = {};
    bindings.attr.init = function(element, context, property, type){
      element.setAttribute(type, Kaskade.prototype.get(context[property]));
    };
    bindings.attr.update = bindings.attr.init;
    
    //CSS
    bindings.css = {};
    bindings.css.init = function(element, context, property){
      var classList = context[property] || [];
      this.placeHolder = classList;
      for(var i=0, len=classList.length; i<len; i++)
        element.classList.add(classList[i]);
    };
    bindings.css.update = function(element, context, property){
      var classList = context[property] || [];
      for(var i=0, len=classList.length; i<len; i++)
        element.classList.add(classList[i]);
      for(var i=0, len=this.placeHolder.length; i<len; i++){
        if(classList.indexOf( this.placeHolder[i] ) < 0)
          element.classList.remove(this.placeHolder[i]);
      }
      this.placeHolder = classList;
    };
    
    //EVENT
    bindings.event = {};
    bindings.event.init = function(element, context, property, type){
      element.addEventHandler(type, function(event){
        context[property].call(context, event, element);
      });
    };
    bindings.event.update = function(){};
    
    //CLICK
    bindings.click = {};
    bindings.click.init = function(element, context, property){
      bindings.event.init.call(this, element, context, property, 'click');
    };
    bindings.click.update = function(){};
    
    //ONREMOVE
    bindings.onRemove = {};
    bindings.onRemove.init = function(element, context, property){
      element.onRemove = context[property];
    }
    bindings.onRemove.update = function(){};
    
    //LIST
    bindings.list = {};
    bindings.list.init = function(element, context, property, type){
      this.onAdd = element.onAdd || this.onAdd;
      this.onRemove = element.onRemove || this.onRemove;
      this.placeHolder = document.createTextNode('');
      if(type)
        this.templateOverride = type;

      element.parentNode.insertBefore(this.placeHolder, element);

      var list = context[property].array;
      for(var i=0, len=list.length; i<len; i++){
        if(i<len-1){
          var nextElement = element.cloneNode();
          element.parentNode.insertBefore(nextElement, element.nextSibling);
        }

        var $name = list[i].$name;
        if(this.templateOverride)
          list[i].$name = this.templateOverride;
        var nodes = Kaskade.prototype.renderTemplate(list[i], element);
        list[i].$name = $name;

        this.listStack.push(nodes);
        if(i<len-1)
          element = nextElement;
      }

      if(context.$notify){
        for(var p in context){
          context.$notify(p);
        }
      }
    };
    bindings.list.update = function(element, context, mutation, value){
      switch(mutation){
          
        case 'push':
          var lastNodes = this.listStack.last(),
              element = element.cloneNode(),
              lastElement;
          if(lastNodes)
            lastElement = lastNodes.last();
          else
            lastElement = this.placeHolder;
          
          lastElement.parentNode.insertBefore(element, lastElement.nextSibling);
          
          var $name = value.$name;
          if(this.templateOverride)
            value.$name = this.templateOverride;
          var nodes = Kaskade.prototype.renderTemplate(value, element);
          value.$name = $name;
          
          this.listStack.push(nodes);
          this.onAdd(nodes, function(){});
          break;
          
        case 'pop':
          var lastNodes = this.listStack.pop();
          if(lastNodes){
            this.onRemove(lastNodes, function(){
              for(var i=0, len=lastNodes.length; i<len; i++){
                lastNodes[i].parentNode.removeChild(lastNodes[i]);
              }
            });
          }
          break;
          
        case 'remove':
          if(value >= 0){
            var lastNodes = this.listStack.splice(value, 1)[0];
            if(lastNodes){
              this.onRemove(lastNodes, function(){
                for(var i=0, len=lastNodes.length; i<len; i++){
                  lastNodes[i].parentNode.removeChild(lastNodes[i]);
                }
              });
            }
          }
          break;
      }
    };
    
    //PARTIAL
    bindings.partial = {};
    bindings.partial.init = function(element, context, property){
      var name = Kaskade.prototype.get(context[property]),
          $name = context.$name;
      context.$name = name;
      Kaskade.prototype.renderTemplate(context, element);
      context.$name = $name;
    };
    bindings.partial.update = function(){};
    
  })();
  /** /BINDINGS **/
  
  
  
  
  
  /** TEMPLATE-PARSER **/
  Kaskade.prototype.renderTemplate = function parseTemplate(obj, node){
    var klassName = obj.$name,
        template = document.querySelector('#'+klassName),
        temp = document.createElement('ELEMENT');
    
    if(klassName){

      temp.innerHTML = template.textContent;
      
      if(node.parentNode)
        node.parentNode.replaceChild(temp, node);
      else
        node.appendChild(temp);
      
      var descendants = temp.querySelectorAll('*:not([data-render])');
      for(var d=0, dlen=descendants.length; d<dlen; d++){
        Kaskade.prototype.BindingManager.processBindings(descendants[d], obj);
      }

      Kaskade.prototype.parseTemplates(obj, temp);
      
      var frag = document.createDocumentFragment(),
          childNodes = [].filter.call(temp.childNodes, function(){return true;});
      for(var n=0, nlen=childNodes.length; n<nlen; n++){
        frag.appendChild(childNodes[n]);
      }
      
      temp.parentNode.replaceChild(frag, temp);
      
      return childNodes;
    }
    else{
      throw(new Error(node.outerHTML + ' Cannot render'));
    }
  };
  
  Kaskade.prototype.parseTemplates = function parseTemplates(context, element){
    var element = element || document.documentElement;
    var nodes = element.querySelectorAll('element[data-render]');
    for(var i=0, len=nodes.length; i<len; i++){

      var node = nodes[i],
          objName = node.getDataset().render,
          obj = context[objName];

      if(obj){
        Kaskade.prototype.renderTemplate(obj, node);
      }
      else{
        throw(new Error(node.outerHTML + ' "' + objName + '" not found in context "' + context.$name + '"') );
      }

    }
  };
  /** /TEMPLATE-PARSER **/
  
  
  
  
  
  /** ATTACH **/
  Kaskade.prototype.attach = function(context, element){
    Kaskade.prototype.Routine.begin();
    Kaskade.prototype.parseTemplates(context, element);
    Kaskade.prototype.Routine.begin();
  };
  /** /ATTACH **/
  
  return new Kaskade();
})();
